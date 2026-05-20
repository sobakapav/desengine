import {
  DEFAULT_SANDPACK_UI_KIT_ID,
  normalizeSandpackUiKitId,
  type SandpackUiKitId,
} from "@/lib/lab/sandpack-ui-kits.config"

export type ProjectUiMode = "html-tags"

export type Project = {
  id: string
  title: string
  uiKitId: SandpackUiKitId
  uiMode: ProjectUiMode
}

export type ProjectCompatibilityStatus = "compatible" | "incompatible"

export type ProjectCompatibility = {
  status: ProjectCompatibilityStatus
  message: string
}

export type RawProject = {
  id?: string | null
  title?: string | null
  uiKitId?: string | null
  uiMode?: string | null
}

const DEFAULT_PROJECT_UI_MODE: ProjectUiMode = "html-tags"

const allowedHtmlTagNames = new Set([
  "a",
  "article",
  "aside",
  "b",
  "button",
  "caption",
  "code",
  "div",
  "em",
  "fieldset",
  "figcaption",
  "figure",
  "footer",
  "form",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "header",
  "hr",
  "i",
  "img",
  "input",
  "label",
  "legend",
  "li",
  "main",
  "nav",
  "ol",
  "option",
  "p",
  "pre",
  "section",
  "select",
  "small",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "textarea",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
])

const uiKitImportPatterns = [
  /from\s+["']@\/components\/ui\//,
  /from\s+["']antd["']/,
  /from\s+["']@mui\//,
  /from\s+["']lucide-react["']/,
  /from\s+["']@radix-ui\//,
]

function normalizeProjectUiMode(rawUiMode?: string | null): ProjectUiMode {
  const raw = rawUiMode?.trim().toLowerCase()
  if (!raw) return DEFAULT_PROJECT_UI_MODE
  if (raw === "html" || raw === "html-tags" || raw === "native" || raw === "none") return "html-tags"
  return DEFAULT_PROJECT_UI_MODE
}

function createDefaultProject(id = "lab-local-project"): Project {
  return {
    id,
    title: "Локальный проект",
    uiKitId: DEFAULT_SANDPACK_UI_KIT_ID,
    uiMode: DEFAULT_PROJECT_UI_MODE,
  }
}

function normalizeProject(rawProject: RawProject | null | undefined): Project {
  const fallback = createDefaultProject(rawProject?.id || undefined)
  return {
    id: typeof rawProject?.id === "string" && rawProject.id.trim() ? rawProject.id.trim() : fallback.id,
    title: typeof rawProject?.title === "string" && rawProject.title.trim() ? rawProject.title.trim() : fallback.title,
    uiKitId: normalizeSandpackUiKitId(rawProject?.uiKitId),
    uiMode: normalizeProjectUiMode(rawProject?.uiMode),
  }
}

function getProjectStorageKey(taskId: string) {
  return `desengine:project:${taskId}`
}

function findDisallowedJsxTag(componentSource: string) {
  const jsxTagPattern = /<\s*([A-Za-z][A-Za-z0-9._:-]*)\b/g
  let match: RegExpExecArray | null

  while ((match = jsxTagPattern.exec(componentSource))) {
    const tagName = match[1]
    if (!tagName || tagName.includes(".")) return tagName
    if (tagName[0] === tagName[0].toUpperCase()) return tagName
    if (!allowedHtmlTagNames.has(tagName)) return tagName
  }

  return null
}

function validateHtmlTagsComponentSource(componentSource: string): ProjectCompatibility {
  const uiKitImport = uiKitImportPatterns.find((pattern) => pattern.test(componentSource))
  if (uiKitImport) {
    return {
      status: "incompatible",
      message: "Режим html-tags не подключает UI kit: удалите импорты из components/ui или внешних UI kit-пакетов.",
    }
  }

  const disallowedTag = findDisallowedJsxTag(componentSource)
  if (disallowedTag) {
    return {
      status: "incompatible",
      message: `Режим html-tags допускает только HTML-теги; найден JSX-тег <${disallowedTag}>.`,
    }
  }

  return {
    status: "compatible",
    message: "Компонент совместим с режимом html-tags.",
  }
}

function resolveProjectPreviewConfig(project: Project) {
  return {
    ...project,
    effectiveUiKitId: project.uiKitId,
  }
}

export {
  DEFAULT_PROJECT_UI_MODE,
  allowedHtmlTagNames,
  createDefaultProject,
  getProjectStorageKey,
  normalizeProject,
  normalizeProjectUiMode,
  resolveProjectPreviewConfig,
  validateHtmlTagsComponentSource,
}
