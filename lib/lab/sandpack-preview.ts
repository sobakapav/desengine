import {
  DEFAULT_SANDPACK_UI_KIT_ID,
  normalizeSandpackUiKitId,
  sandpackUiKitsConfig,
  type SandpackUiKitId,
  validateSandpackUiKitsConfig,
} from "@/lib/lab/sandpack-ui-kits.config"
import { loadSandpackDefaultTemplates } from "@/lib/lab/sandpack-default-templates"
import { fallbackAppTsx } from "@/lib/lab/sandpack-template-fallback"

type SandpackFileEntry = string | {
  code: string
  hidden?: boolean
  readOnly?: boolean
}

function toHiddenFiles(
  files: Record<string, string>,
  relativeRoot: string,
): SandpackPreviewFiles {
  return Object.fromEntries(
    Object.entries(files).map(([filePath, code]) => [
      filePath,
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
}

type SandpackAppTemplateOptions = {
  appTsx: string
  previewCss: string | null
  levelTemplateRuntime: string
}

const defaultStylesSource = "export const styles = {};\n"
const defaultMockSource = "export const mock = {};\n"
const defaultPropsSource = "export {};\n"

const baseDependencies = {
  "@types/react": "^19.0.8",
  "@types/react-dom": "^19.0.3",
  react: "^19.0.0",
  "react-dom": "^19.0.0",
  "react-scripts": "^5.0.1",
  typescript: "^5.0.0",
}

const basePackageJson = {
  main: "/index.tsx",
  dependencies: baseDependencies,
}

function buildMainTsx(indexTsxTemplate: string, indexTsxImports: string[] = []) {
  const extraImports = indexTsxImports.length ? `${indexTsxImports.join("\n")}\n` : ""
  return indexTsxTemplate.replace("/* __EXTRA_IMPORTS__ */", extraImports)
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

function rewriteRootAliasImports(code: string, relativeRoot: string) {
  return code
    .replaceAll("from \"@/", `from "${relativeRoot}`)
    .replaceAll("from '@/", `from '${relativeRoot}`)
    .replaceAll("import(\"@/", `import("${relativeRoot}`)
    .replaceAll("import('@/", `import('${relativeRoot}`)
}

function buildSandpackPreviewPayload(
  sourceFiles: SandpackPreviewSourceFiles,
  options: {
    uiKitId?: SandpackUiKitId | string | null
    appTemplate?: SandpackAppTemplateOptions | null
  } = {},
): SandpackPreviewPayload {
  validateSandpackUiKitsConfig()

  const templates = loadSandpackDefaultTemplates()

  const resolvedUiKitId = typeof options.uiKitId === "string"
    ? normalizeSandpackUiKitId(options.uiKitId)
    : (options.uiKitId ?? DEFAULT_SANDPACK_UI_KIT_ID)

  const uiKit = sandpackUiKitsConfig[resolvedUiKitId] ?? sandpackUiKitsConfig[DEFAULT_SANDPACK_UI_KIT_ID]
  const dependencies = {
    ...basePackageJson.dependencies,
    ...uiKit.dependencies,
  }

  const appTemplate = options.appTemplate ?? null
  const resolvedAppTsx = appTemplate?.appTsx ?? fallbackAppTsx
  const resolvedLevelRuntime = appTemplate?.levelTemplateRuntime ?? "export const levelRuntime = {} as const;\n"
  const resolvedPreviewCss = (() => {
    const previewCssBase = sourceFiles.previewCss ?? templates.previewCssSource
    const levelCss = appTemplate?.previewCss
    if (!levelCss) return previewCssBase
    return `${previewCssBase}\n\n/* level preview.css */\n${levelCss}\n`
  })()

  const packageJsonBase = templates.packageJson

  const files: SandpackPreviewFiles = {
    "/public/index.html": hidden(templates.indexHtml),
    "/package.json": hidden(JSON.stringify({ ...packageJsonBase, ...basePackageJson, dependencies }, null, 2)),
    "/tsconfig.json": hidden(JSON.stringify(templates.tsconfigJson, null, 2)),
    "/index.tsx": hidden(buildMainTsx(templates.indexTsxTemplate, uiKit.indexTsxImports)),
    "/App.tsx": hidden(resolvedAppTsx || ""),
    "/level-template-runtime.ts": hidden(resolvedLevelRuntime),
    "/Component.tsx": {
      code: rewriteRootAliasImports(sourceFiles.component, "./"),
      readOnly: true,
    },
    "/Component.stories.ts": hidden(sourceFiles.stories ?? ""),
    "/styles.ts": hidden(sourceFiles.styles ?? defaultStylesSource),
    "/mock.ts": hidden(sourceFiles.mock ?? defaultMockSource),
    "/props.ts": hidden(sourceFiles.props ?? defaultPropsSource),
    "/styles.css": hidden(resolvedPreviewCss),
    "/lib/system/utils.ts": hidden(sourceFiles.systemUtils),
    "/lib/utils.ts": hidden(`
      import { clsx, type ClassValue } from "clsx"
      import { twMerge } from "tailwind-merge"
      export function cn(...inputs: ClassValue[]) {
        return twMerge(clsx(inputs))
      }
      `),
    "/tailwind.config.js": hidden(templates.tailwindConfigJs),
    "/postcss.config.js": hidden(templates.postcssConfigJs),
  }

  if (resolvedUiKitId === "shadcn") {
    files["/components/ui/badge.tsx"] = hidden(rewriteRootAliasImports(sourceFiles.uiBadge, "../../"))
    Object.assign(files, toHiddenFiles(sourceFiles.shadcnFiles ?? {}, "../../"))
  }

  return {
    files,
    customSetup: {
      dependencies,
      entry: "/index.tsx",
      environment: "create-react-app",
    },
    options: {
      activeFile: "/Component.tsx",
      visibleFiles: ["/Component.tsx"],
      externalResources: ["https://cdn.tailwindcss.com"],
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
