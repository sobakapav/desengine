import fs from "node:fs"
import path from "node:path"

import {
  DEFAULT_SANDPACK_UI_KIT_ID,
  normalizeSandpackUiKitId,
  sandpackUiKitsConfig,
  type SandpackUiKitId,
  validateSandpackUiKitsConfig,
} from "@/lib/lab/sandpack-ui-kits.config"
import { loadSandpackDefaultTemplates } from "@/lib/lab/sandpack-default-templates"
import { resolveRuntimeDependencies } from "@/lib/lab/sandpack-runtime-dependencies"
import { fallbackAppTsx } from "@/lib/lab/sandpack-template-fallback"
import {
  createDefaultProject,
  normalizeProject,
  resolveProjectPreviewConfig,
  validateHtmlTagsComponentSource,
  validateUiKitComponentSource,
  type Project,
  type ProjectCompatibility,
  type ProjectUiMode,
  type RawProject,
} from "@/lib/project/runtime"
import { compile as compileTailwindCss } from "tailwindcss"
import rootPackageJson from "../../package.json"

type SandpackFileEntry = string | {
  code: string
  hidden?: boolean
  readOnly?: boolean
}

function toHiddenFiles(
  files: Record<string, string>,
  relativeRoot: string,
  targetRoot = "",
): SandpackPreviewFiles {
  return Object.fromEntries(
    Object.entries(files).map(([filePath, code]) => [
      `${targetRoot}${filePath}`,
      hidden(rewriteRootAliasImports(code, relativeRoot)),
    ]),
  )
}

type SandpackPreviewFiles = Record<string, SandpackFileEntry>

type SandpackPreviewSourceFiles = {
  component: string
  stories?: string
  styles?: string
  mock?: string
  props?: string
  uiBadge: string
  systemUtils: string
  previewCss?: string
  shadcnFiles?: Record<string, string>
}

type SandpackPreviewPayload = {
  files: SandpackPreviewFiles
  customSetup: {
    dependencies: Record<string, string>
    entry: string
    environment: "create-react-app"
  }
  options: {
    activeFile: string
    visibleFiles: string[]
    externalResources: string[]
  }
  project: Project & {
    effectiveUiKitId: SandpackUiKitId
    compatibility: ProjectCompatibility
  }
  debug?: {
    shimVersion: string
    rcShimPaths: string[]
    pickerLocaleShim?: {
      enUsJs?: string
      enUsIndexJs?: string
    }
  }
}

type SandpackAppTemplateOptions = {
  appTsx: string
  previewCss: string | null
  levelTemplateRuntime: string
}

const previewRuntimeContractImport = 'import { PreviewRuntimeContractBoundary } from "./preview-runtime-contract";'
const previewRuntimeContractMarkerSource = "desengine-sandpack-preview"

const defaultStylesSource = "export const styles = {};\n"
const defaultMockSource = "export const mock = {};\n"
const defaultPropsSource = "export {};\n"
const previewStylesheetVirtualPath = "/src/styles.css"
const previewCompiledCssCache = new Map<string, Promise<string>>()

function extractImportSpecifiers(source: string) {
  const specifiers = new Set<string>()
  const patterns = [
    /\bimport\s+(?:type\s+)?(?:[\w*\s{},]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bexport\s+(?:type\s+)?(?:[\w*\s{},]*?\s+from\s+)?["']([^"']+)["']/g,
    /\bimport\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\(\s*["']([^"']+)["']\s*\)/g,
  ]

  for (const pattern of patterns) {
    for (const match of source.matchAll(pattern)) {
      const specifier = match[1]?.trim()
      if (specifier) {
        specifiers.add(specifier)
      }
    }
  }

  return [...specifiers]
}

function resolveBarePackageName(specifier: string) {
  if (
    specifier.startsWith(".")
    || specifier.startsWith("/")
    || specifier.startsWith("@/")
  ) {
    return null
  }

  if (specifier.startsWith("@")) {
    const [scope, name] = specifier.split("/")
    return scope && name ? `${scope}/${name}` : specifier
  }

  return specifier.split("/")[0] ?? null
}

function resolveVirtualLocalImport(fromFilePath: string, specifier: string, availableFiles: Set<string>) {
  const normalizedBase = specifier.startsWith("@/")
    ? path.posix.join("/src", specifier.slice(2))
    : path.posix.normalize(path.posix.join(path.posix.dirname(fromFilePath), specifier))

  const candidates = [
    normalizedBase,
    `${normalizedBase}.ts`,
    `${normalizedBase}.tsx`,
    `${normalizedBase}.js`,
    `${normalizedBase}.jsx`,
    path.posix.join(normalizedBase, "index.ts"),
    path.posix.join(normalizedBase, "index.tsx"),
    path.posix.join(normalizedBase, "index.js"),
    path.posix.join(normalizedBase, "index.jsx"),
  ]

  return candidates.find((candidate) => availableFiles.has(candidate)) ?? null
}

function collectRuntimeDependencyImports(sourceFiles: Record<string, string>, entryFiles: string[]) {
  const availableFiles = new Set(Object.keys(sourceFiles))
  const visitedFiles = new Set<string>()
  const barePackages = new Set<string>()
  const queue = [...entryFiles]

  while (queue.length > 0) {
    const filePath = queue.shift()
    if (!filePath || visitedFiles.has(filePath)) continue
    visitedFiles.add(filePath)

    const source = sourceFiles[filePath]
    if (!source) continue

    for (const specifier of extractImportSpecifiers(source)) {
      const barePackage = resolveBarePackageName(specifier)
      if (barePackage) {
        barePackages.add(barePackage)
        continue
      }

      const nextLocalFile = resolveVirtualLocalImport(filePath, specifier, availableFiles)
      if (nextLocalFile && !visitedFiles.has(nextLocalFile)) {
        queue.push(nextLocalFile)
      }
    }
  }

  return [...barePackages].sort()
}

function getRootPackageVersion(name: string) {
  const rootPackages = rootPackageJson as {
    dependencies?: Record<string, string>
    devDependencies?: Record<string, string>
  }
  const version = rootPackages.dependencies?.[name] ?? rootPackages.devDependencies?.[name]

  if (!version) {
    throw new Error(`В корневом package.json не задана зависимость '${name}', но она нужна Sandpack preview`)
  }

  return version
}

const baseDependencies = {
  "@types/react": "^19.0.8",
  "@types/react-dom": "^19.0.3",
  "@tailwindcss/postcss": getRootPackageVersion("@tailwindcss/postcss"),
  postcss: getRootPackageVersion("postcss"),
  react: "^19.0.0",
  "react-dom": "^19.0.0",
  "react-scripts": "^5.0.1",
  tailwindcss: getRootPackageVersion("tailwindcss"),
  typescript: "^5.0.0",
}

const basePackageJson = {
  main: "/src/index.tsx",
  dependencies: baseDependencies,
}

type ResolvedPreviewProject = {
  project: Project
  resolvedUiKitId: SandpackUiKitId
  compatibility: ProjectCompatibility
}
type SandpackUiKitConfig = (typeof sandpackUiKitsConfig)[SandpackUiKitId]

function buildMainTsx(indexTsxTemplate: string, indexTsxImports: string[] = []) {
  const extraImports = indexTsxImports.length ? `${indexTsxImports.join("\n")}\n` : ""
  return indexTsxTemplate.replace("/* __EXTRA_IMPORTS__ */", extraImports)
}

function buildPreviewRuntimeContractSource() {
  return `import React, { useLayoutEffect } from "react";

const PREVIEW_SOURCE = "${previewRuntimeContractMarkerSource}";
const LOADING_STATUS = "loading";
const READY_STATUS = "ready";
const UNSTYLED_STATUS = "unstyled-dom";
const RENDER_ERROR_STATUS = "render-error";
const PROBE_DATASET_ATTR = "data-desengine-preview-contract";
const probeExpectations = {
  backgroundColor: "rgb(1, 2, 3)",
  color: "rgb(4, 5, 6)",
  width: "137px",
  height: "19px",
} as const;

function updateHost(status: string, message = "") {
  document.documentElement.setAttribute(PROBE_DATASET_ATTR, status);
  window.parent?.postMessage({
    source: PREVIEW_SOURCE,
    type: "contract",
    status,
    message,
  }, "*");
}

function renderErrorNotice(message: string) {
  return (
    <section
      style={{
        border: "1px solid rgba(220, 38, 38, 0.35)",
        borderRadius: 12,
        padding: 16,
        background: "rgba(254, 242, 242, 0.95)",
        color: "#991b1b",
        fontFamily: '"Segoe UI", sans-serif',
      }}
    >
      <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Компонент не удалось отрендерить в preview</h2>
      <pre style={{ margin: 0, whiteSpace: "pre-wrap", wordBreak: "break-word" }}>{message}</pre>
    </section>
  );
}

function getRenderErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) return error.message;
  return "Неизвестная ошибка React-рендера внутри preview.";
}

class PreviewRuntimeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { errorMessage: string | null }
> {
  state = { errorMessage: null };

  static getDerivedStateFromError(error: unknown) {
    return { errorMessage: getRenderErrorMessage(error) };
  }

  componentDidCatch(error: unknown) {
    updateHost(RENDER_ERROR_STATUS, getRenderErrorMessage(error));
  }

  render() {
    if (this.state.errorMessage) {
      return renderErrorNotice(this.state.errorMessage);
    }

    return this.props.children;
  }
}

function PreviewRuntimeProbe() {
  useLayoutEffect(() => {
    let cancelled = false;
    const attempts = [80, 300, 900, 2000];
    let timeoutId = 0;
    let attemptIndex = 0;

    updateHost(LOADING_STATUS, "Sandpack runtime загружается.");

    const evaluateProbe = () => {
      if (cancelled) return;

      const probe = document.querySelector<HTMLElement>("[data-desengine-preview-probe='tailwind']");
      if (!probe) {
        updateHost(UNSTYLED_STATUS, "Preview runtime не смог подготовить Tailwind probe.");
        return;
      }

      const style = window.getComputedStyle(probe);
      const ready = style.backgroundColor === probeExpectations.backgroundColor
        && style.color === probeExpectations.color
        && style.width === probeExpectations.width
        && style.height === probeExpectations.height;

      if (ready) {
        updateHost(READY_STATUS);
        return;
      }

      const hasNextAttempt = attemptIndex < attempts.length - 1;
      const message = "Sandpack отрисовал DOM, но preview CSS/Tailwind не применились к probe-элементу.";

      if (!hasNextAttempt) {
        updateHost(UNSTYLED_STATUS, message);
        return;
      }

      attemptIndex += 1;
      timeoutId = window.setTimeout(evaluateProbe, attempts[attemptIndex]);
    };

    timeoutId = window.setTimeout(evaluateProbe, attempts[attemptIndex]);

    return () => {
      cancelled = true;
      window.clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div
      aria-hidden="true"
      data-desengine-preview-probe="tailwind"
      className="w-[137px] h-[19px] bg-[rgb(1,2,3)] text-[rgb(4,5,6)]"
      style={{
        position: "fixed",
        top: -9999,
        left: -9999,
        pointerEvents: "none",
        opacity: 0,
      }}
    >
      probe
    </div>
  );
}

function PreviewRuntimeContractBoundary({ children }: { children: React.ReactNode }) {
  return (
    <>
      <PreviewRuntimeProbe />
      <PreviewRuntimeErrorBoundary>{children}</PreviewRuntimeErrorBoundary>
    </>
  );
}

export { PreviewRuntimeContractBoundary };
`
}

function injectPreviewRuntimeContract(appTsx: string) {
  const withImport = appTsx.includes(previewRuntimeContractImport)
    ? appTsx
    : appTsx.replace(
        'import { levelRuntime } from "./level-template-runtime"',
        `import { levelRuntime } from "./level-template-runtime"\n${previewRuntimeContractImport}`,
      )

  if (withImport.includes("<PreviewRuntimeContractBoundary>")) {
    return withImport.replace(
      /<PreviewRuntimeContractBoundary>\s*<Component \{\.\.\.pickPreviewProps\(\)\} \/>\s*<\/PreviewRuntimeContractBoundary>/,
      `<PreviewRuntimeContractBoundary>\n        <Component {...pickPreviewProps()} />\n      </PreviewRuntimeContractBoundary>`,
    )
  }

  return withImport.replace(
    "<Component {...pickPreviewProps()} />",
    `<PreviewRuntimeContractBoundary>
        <Component {...pickPreviewProps()} />
      </PreviewRuntimeContractBoundary>`,
  )
}

// const previewCssSource = `
// :root {
//   --background: #ffffff;
//   --foreground: #111318;
//   --border: #e2e5ea;
//   --primary: #111318;
//   --primary-foreground: #ffffff;
//   --secondary: #f4f6f8;
//   --secondary-foreground: #111318;
//   --muted: #f4f6f8;
//   --muted-foreground: #5f6672;
//   --destructive: #dc2626;
//   --radius: 0.375rem;
// }

// *,
// *::before,
// *::after {
//   box-sizing: border-box;
//   border-color: var(--border);
// }

// html,
// body,
// #root {
//   min-height: 100%;
//   margin: 0;
// }

// body {
//   font-family: "Segoe UI", "SF Pro Text", "SF Pro Display", "Helvetica Neue", Helvetica, Arial, system-ui, sans-serif;
//   -webkit-font-smoothing: antialiased;
//   text-rendering: optimizeLegibility;
//   background: transparent;
//   color: var(--foreground);
// }

// .desengine-preview-root {
//   min-height: 8rem;
//   padding: 0;
// }

// .inline-flex { display: inline-flex; }
// .flex { display: flex; }
// .grid { display: grid; }
// .hidden { display: none; }
// .h-5 { height: 1.25rem; }
// .w-fit { width: fit-content; }
// .shrink-0 { flex-shrink: 0; }
// .items-center { align-items: center; }
// .justify-center { justify-content: center; }
// .gap-1 { gap: 0.25rem; }
// .overflow-hidden { overflow: hidden; }
// .rounded-full { border-radius: 9999px; }
// .border { border-width: 1px; border-style: solid; }
// .border-transparent { border-color: transparent; }
// .border-border { border-color: var(--border); }
// .bg-primary { background-color: var(--primary); }
// .bg-secondary { background-color: var(--secondary); }
// .bg-muted { background-color: var(--muted); }
// [class~="bg-input/20"] { background-color: rgba(226, 229, 234, 0.2); }
// [class~="bg-destructive/10"] { background-color: rgba(220, 38, 38, 0.1); }
// .text-primary-foreground { color: var(--primary-foreground); }
// .text-secondary-foreground { color: var(--secondary-foreground); }
// .text-muted-foreground { color: var(--muted-foreground); }
// .text-destructive { color: var(--destructive); }
// .text-foreground { color: var(--foreground); }
// .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
// [class~="py-0.5"] { padding-top: 0.125rem; padding-bottom: 0.125rem; }
// [class~="text-[0.625rem]"] { font-size: 0.625rem; }
// .text-xs { font-size: 0.75rem; line-height: 1rem; }
// .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
// .font-medium { font-weight: 500; }
// .whitespace-nowrap { white-space: nowrap; }
// .transition-all { transition-property: all; transition-duration: 150ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }
// [class~="hover:bg-muted"]:hover { background-color: var(--muted); }
// [class~="hover:text-muted-foreground"]:hover { color: var(--muted-foreground); }
// `

function hidden(code: string): SandpackFileEntry {
  return {
    code,
    hidden: true,
    readOnly: true,
  }
}

function buildPackageCompatibilityShimsForAntd() {
  const shims: SandpackPreviewFiles = {}
  const specifiers = [
    {
      subpath: "generate/dayjs",
      target: "/node_modules/@rc-component/picker/es/generate/dayjs.js",
    },
    {
      subpath: "locale/en_US",
      target: "/node_modules/@rc-component/picker/es/locale/en_US.js",
    },
    {
      subpath: "locale/en_GB",
      target: "/node_modules/@rc-component/picker/es/locale/en_GB.js",
    },
  ]

  for (const { subpath, target } of specifiers) {
    const jsPath = `/node_modules/@rc-component/picker/${subpath}.js`
    const indexPath = `/node_modules/@rc-component/picker/${subpath}/index.js`
    const source = `export * from "${target}";\nexport { default } from "${target}";\n`
    shims[jsPath] = hidden(source)
    shims[indexPath] = hidden(source)
  }

  return {
    shims,
    shimPaths: Object.keys(shims).sort(),
  }
}

function buildAntdPatchedLocaleFiles() {
  const patched: SandpackPreviewFiles = {}
  patched["/node_modules/antd/es/date-picker/locale/en_US.js"] = hidden(
    `import CalendarLocale from '/node_modules/@rc-component/picker/es/locale/en_US.js';
import TimePickerLocale from '../../time-picker/locale/en_US';
const locale = {
  lang: {
    placeholder: 'Select date',
    yearPlaceholder: 'Select year',
    quarterPlaceholder: 'Select quarter',
    monthPlaceholder: 'Select month',
    weekPlaceholder: 'Select week',
    rangePlaceholder: ['Start date', 'End date'],
    rangeYearPlaceholder: ['Start year', 'End year'],
    rangeQuarterPlaceholder: ['Start quarter', 'End quarter'],
    rangeMonthPlaceholder: ['Start month', 'End month'],
    rangeWeekPlaceholder: ['Start week', 'End week'],
    ...CalendarLocale
  },
  timePickerLocale: {
    ...TimePickerLocale
  }
};
export default locale;
`,
  )
  return patched
}

function rewriteRootAliasImports(code: string, relativeRoot: string) {
  return code
    .replaceAll("from \"@/", `from "${relativeRoot}`)
    .replaceAll("from '@/", `from '${relativeRoot}`)
    .replaceAll("import(\"@/", `import("${relativeRoot}`)
    .replaceAll("import('@/", `import('${relativeRoot}`)
}

function buildHtmlTagsFallbackComponent(message: string) {
  const safeMessage = JSON.stringify(message)

  return `export default function Component() {
  const message = ${safeMessage};

  return (
    <section style={{
      border: "1px solid #f0b4b4",
      borderRadius: 12,
      padding: 16,
      background: "#fff7f7",
      color: "#7f1d1d",
      fontFamily: "sans-serif"
    }}>
      <h2 style={{ margin: "0 0 8px", fontSize: 16 }}>Preview переключён в безопасный режим</h2>
      <p style={{ margin: 0 }}>{message}</p>
    </section>
  );
}
`
}

function extractTailwindCandidates(source: string) {
  const tokens = new Set<string>()

  for (const match of source.matchAll(/(["'`])((?:\\.|(?!\1)[\s\S])*)\1/g)) {
    const literalContent = match[2]
    if (!literalContent) continue

    for (const token of literalContent.split(/\s+/)) {
      const normalizedToken = token.trim()
      if (!normalizedToken) continue
      tokens.add(normalizedToken)
    }
  }

  return [...tokens]
}

function resolveTailwindBase(base: string | undefined) {
  if (typeof base === "string" && base.length > 0) {
    return base
  }

  return path.posix.dirname(previewStylesheetVirtualPath)
}

function resolveTailwindVirtualPath(id: string, base: string | undefined) {
  const resolvedBase = resolveTailwindBase(base)

  if (id.startsWith(".")) {
    if (resolvedBase.startsWith("/")) {
      return path.posix.normalize(path.posix.join(resolvedBase, id))
    }

    return path.resolve(resolvedBase, id)
  }

  return id
}

async function buildPrecompiledPreviewCss(args: {
  componentSource: string
  resolvedAppTsx: string
  resolvedLevelRuntime: string
  resolvedPreviewCss: string
  sourceFiles: SandpackPreviewSourceFiles
}) {
  const {
    componentSource,
    resolvedAppTsx,
    resolvedLevelRuntime,
    resolvedPreviewCss,
    sourceFiles,
  } = args
  const runtimeContractSource = buildPreviewRuntimeContractSource()
  const candidateSources = [
    componentSource,
    sourceFiles.stories ?? "",
    sourceFiles.styles ?? defaultStylesSource,
    sourceFiles.mock ?? defaultMockSource,
    sourceFiles.props ?? defaultPropsSource,
    sourceFiles.uiBadge,
    ...Object.values(sourceFiles.shadcnFiles ?? {}),
    resolvedAppTsx,
    resolvedLevelRuntime,
    runtimeContractSource,
  ]
  const candidates = [...new Set(candidateSources.flatMap((source) => extractTailwindCandidates(source)))].sort()
  const cacheKey = JSON.stringify({
    candidates,
    previewCss: resolvedPreviewCss,
  })
  const cachedCompiledCss = previewCompiledCssCache.get(cacheKey)

  if (cachedCompiledCss) {
    return cachedCompiledCss
  }

  const compilePromise = (async () => {
    const virtualFiles = new Map<string, string>([
      [previewStylesheetVirtualPath, resolvedPreviewCss],
    ])

    const compiled = await compileTailwindCss(resolvedPreviewCss, {
      base: "/",
      from: previewStylesheetVirtualPath,
      loadStylesheet: async (id, base) => {
        if (typeof id !== "string" || id.length === 0) {
          throw new Error(`Tailwind stylesheet loader получил пустой import id (base=${String(base)})`)
        }

        const resolvedPath = resolveTailwindVirtualPath(id, base)
        const source = virtualFiles.get(resolvedPath)

        if (typeof source === "string") {
          return {
            path: resolvedPath,
            base: path.posix.dirname(resolvedPath),
            content: source,
          }
        }

        if (id === "tailwindcss") {
          const absolutePath = path.join(process.cwd(), "node_modules", "tailwindcss", "index.css")
          return {
            path: absolutePath,
            base: path.dirname(absolutePath),
            content: fs.readFileSync(absolutePath, "utf-8"),
          }
        }

        const absolutePath = path.resolve(resolveTailwindBase(base), id)
        return {
          path: absolutePath,
          base: path.dirname(absolutePath),
          content: fs.readFileSync(absolutePath, "utf-8"),
        }
      },
    })

    return compiled.build(candidates)
  })()

  previewCompiledCssCache.set(cacheKey, compilePromise)

  try {
    return await compilePromise
  } catch (error) {
    previewCompiledCssCache.delete(cacheKey)
    throw error
  }
}

function resolvePreviewProject(
  sourceFiles: SandpackPreviewSourceFiles,
  options: {
    uiKitId?: SandpackUiKitId | string | null
    uiMode?: ProjectUiMode | string | null
    project?: RawProject | null
  },
): ResolvedPreviewProject {
  const project = normalizeProject(options.project ?? {
    ...createDefaultProject(),
    settings: {
      uiKitId: typeof options.uiKitId === "string"
        ? normalizeSandpackUiKitId(options.uiKitId)
        : (options.uiKitId ?? DEFAULT_SANDPACK_UI_KIT_ID),
      uiMode: options.uiMode ?? undefined,
    },
  })
  const projectPreviewConfig = resolveProjectPreviewConfig(project)
  const resolvedUiKitId = projectPreviewConfig.effectiveUiKitId

  const shouldValidateCompatibility = Boolean(options.project || options.uiMode)
  const compatibility = shouldValidateCompatibility
    ? (
        project.settings.uiMode === "html-tags"
          ? validateHtmlTagsComponentSource(sourceFiles.component)
          : validateUiKitComponentSource(sourceFiles.component, resolvedUiKitId)
      )
    : { status: "compatible" as const, message: "Режим проекта совместим с выбранным UI kit." }

  return { project, resolvedUiKitId, compatibility }
}

function resolvePreviewCss(
  sourceFiles: SandpackPreviewSourceFiles,
  templates: ReturnType<typeof loadSandpackDefaultTemplates>,
  appTemplate: SandpackAppTemplateOptions | null,
) {
  const previewCssBase = sourceFiles.previewCss ?? templates.previewCssSource
  const levelCss = appTemplate?.previewCss
  if (!levelCss) return previewCssBase
  return `${previewCssBase}\n\n/* level preview.css */\n${levelCss}\n`
}

function createBaseSandpackFiles(args: {
  sourceFiles: SandpackPreviewSourceFiles
  templates: ReturnType<typeof loadSandpackDefaultTemplates>
  dependencies: Record<string, string>
  componentSource: string
  compiledPreviewCss: string
  resolvedAppTsx: string
  resolvedLevelRuntime: string
  uiKit: SandpackUiKitConfig
}): SandpackPreviewFiles {
  const {
    sourceFiles,
    templates,
    dependencies,
    componentSource,
    compiledPreviewCss,
    resolvedAppTsx,
    resolvedLevelRuntime,
    uiKit,
  } = args
  const packageJsonBase = templates.packageJson

  return {
    "/public/index.html": hidden(templates.indexHtml),
    "/package.json": hidden(JSON.stringify({ ...packageJsonBase, ...basePackageJson, dependencies }, null, 2)),
    "/tsconfig.json": hidden(JSON.stringify(templates.tsconfigJson, null, 2)),
    "/src/index.tsx": hidden(buildMainTsx(templates.indexTsxTemplate, uiKit.indexTsxImports)),
    "/src/App.tsx": hidden(resolvedAppTsx || ""),
    "/src/preview-runtime-contract.tsx": hidden(buildPreviewRuntimeContractSource()),
    "/src/level-template-runtime.ts": hidden(resolvedLevelRuntime),
    "/src/Component.tsx": {
      code: rewriteRootAliasImports(componentSource, "./"),
      readOnly: true,
    },
    "/src/Component.stories.ts": hidden(sourceFiles.stories ?? ""),
    "/src/styles.ts": hidden(sourceFiles.styles ?? defaultStylesSource),
    "/src/mock.ts": hidden(sourceFiles.mock ?? defaultMockSource),
    "/src/props.ts": hidden(sourceFiles.props ?? defaultPropsSource),
    "/src/styles.css": hidden(compiledPreviewCss),
    "/src/lib/system/utils.ts": hidden(sourceFiles.systemUtils),
    "/src/lib/utils.ts": hidden(`
      import { clsx, type ClassValue } from "clsx"
      import { twMerge } from "tailwind-merge"
      export function cn(...inputs: ClassValue[]) {
        return twMerge(clsx(inputs))
      }
      `),
    "/tailwind.config.js": hidden(templates.tailwindConfigJs),
    "/postcss.config.js": hidden(templates.postcssConfigJs),
  }
}

async function buildSandpackPreviewPayload(
  sourceFiles: SandpackPreviewSourceFiles,
  options: {
    uiKitId?: SandpackUiKitId | string | null
    uiMode?: ProjectUiMode | string | null
    project?: RawProject | null
    appTemplate?: SandpackAppTemplateOptions | null
  } = {},
): Promise<SandpackPreviewPayload> {
  validateSandpackUiKitsConfig()

  const templates = loadSandpackDefaultTemplates()
  const { project, resolvedUiKitId, compatibility } = resolvePreviewProject(sourceFiles, options)
  const uiKit = sandpackUiKitsConfig[resolvedUiKitId] ?? sandpackUiKitsConfig[DEFAULT_SANDPACK_UI_KIT_ID]
  const appTemplate = options.appTemplate ?? null
  const componentSource = compatibility.status === "compatible"
    ? sourceFiles.component
    : buildHtmlTagsFallbackComponent(compatibility.message)
  const resolvedAppTsx = injectPreviewRuntimeContract(appTemplate?.appTsx ?? fallbackAppTsx)
  const resolvedLevelRuntime = appTemplate?.levelTemplateRuntime ?? "export const levelRuntime = {} as const;\n"
  const previewRuntimeContractSource = buildPreviewRuntimeContractSource()
  const dependencySourceFiles: Record<string, string> = {
    "/src/App.tsx": resolvedAppTsx,
    "/src/Component.tsx": componentSource,
    "/src/mock.ts": sourceFiles.mock ?? defaultMockSource,
    "/src/props.ts": sourceFiles.props ?? defaultPropsSource,
    "/src/level-template-runtime.ts": resolvedLevelRuntime,
    "/src/preview-runtime-contract.tsx": previewRuntimeContractSource,
  }

  if (sourceFiles.styles) {
    dependencySourceFiles["/src/styles.ts"] = sourceFiles.styles
  }

  if (resolvedUiKitId === "shadcn") {
    dependencySourceFiles["/src/components/ui/badge.tsx"] = sourceFiles.uiBadge
    for (const [filePath, code] of Object.entries(sourceFiles.shadcnFiles ?? {})) {
      dependencySourceFiles[path.posix.join("/src", filePath)] = code
    }
    dependencySourceFiles["/src/lib/system/utils.ts"] = sourceFiles.systemUtils
  }

  const usedRuntimePackages = collectRuntimeDependencyImports(
    dependencySourceFiles,
    ["/src/App.tsx", "/src/Component.tsx"],
  )
  const directRuntimeDependencies = resolvedUiKitId === "shadcn"
    ? Object.fromEntries(
      usedRuntimePackages.map((packageName) => [
        packageName,
        uiKit.dependencies[packageName] ?? getRootPackageVersion(packageName),
      ]),
    )
    : {
      ...uiKit.dependencies,
      ...Object.fromEntries(
        usedRuntimePackages.map((packageName) => [
          packageName,
          uiKit.dependencies[packageName] ?? getRootPackageVersion(packageName),
        ]),
      ),
    }
  const dependencies = {
    ...basePackageJson.dependencies,
    ...resolveRuntimeDependencies(directRuntimeDependencies),
  }
  const compiledPreviewCss = await buildPrecompiledPreviewCss({
    componentSource,
    resolvedAppTsx,
    resolvedLevelRuntime,
    resolvedPreviewCss: resolvePreviewCss(sourceFiles, templates, appTemplate),
    sourceFiles,
  })
  const files = createBaseSandpackFiles({
    sourceFiles,
    templates,
    dependencies,
    componentSource,
    compiledPreviewCss,
    resolvedAppTsx,
    resolvedLevelRuntime,
    uiKit,
  })

  if (resolvedUiKitId === "shadcn") {
    files["/src/components/ui/badge.tsx"] = hidden(rewriteRootAliasImports(sourceFiles.uiBadge, "../../"))
    Object.assign(files, toHiddenFiles(sourceFiles.shadcnFiles ?? {}, "../../", "/src"))
  }

  if (resolvedUiKitId === "ant") {
    const { shims, shimPaths } = buildPackageCompatibilityShimsForAntd()
    Object.assign(files, shims)
    Object.assign(files, buildAntdPatchedLocaleFiles())

    const pickerEnUsJs = files["/node_modules/@rc-component/picker/locale/en_US.js"]
    const pickerEnUsIndexJs = files["/node_modules/@rc-component/picker/locale/en_US/index.js"]
    const readCode = (entry: SandpackFileEntry | undefined) =>
      typeof entry === "string" ? entry : entry?.code

    return {
      files,
      customSetup: {
        dependencies,
        entry: "/src/index.tsx",
        environment: "create-react-app",
      },
      options: {
        activeFile: "/src/Component.tsx",
        visibleFiles: ["/src/Component.tsx"],
        externalResources: [],
      },
      project: {
        ...project,
        effectiveUiKitId: resolvedUiKitId,
        compatibility,
      },
      debug: {
        shimVersion: "2026-05-20-ant-shim-v3",
        rcShimPaths: shimPaths,
        pickerLocaleShim: {
          enUsJs: readCode(pickerEnUsJs),
          enUsIndexJs: readCode(pickerEnUsIndexJs),
        },
      },
    }
  }

  return {
    files,
    customSetup: {
      dependencies,
      entry: "/src/index.tsx",
      environment: "create-react-app",
    },
    options: {
      activeFile: "/src/Component.tsx",
      visibleFiles: ["/src/Component.tsx"],
      externalResources: [],
    },
    project: {
      ...project,
      effectiveUiKitId: resolvedUiKitId,
      compatibility,
    },
  }
}

export {
  buildSandpackPreviewPayload,
  type SandpackFileEntry,
  type SandpackPreviewFiles,
  type SandpackPreviewPayload,
  type SandpackPreviewSourceFiles,
}
