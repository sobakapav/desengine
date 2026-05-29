import {
  DEFAULT_SANDPACK_UI_KIT_ID,
  normalizeSandpackUiKitId,
  type SandpackUiKitId,
} from "@/lib/lab/sandpack-ui-kits.config"

export type ProjectUiMode = "ui-kit" | "html-tags"

export type ProjectSettings = {
  uiKitId: SandpackUiKitId
  uiMode: ProjectUiMode
}

export type ProjectWorkspace = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  settings: ProjectSettings
}

export type Project = ProjectWorkspace

export type ProjectCompatibilityStatus = "compatible" | "incompatible"

export type ProjectCompatibility = {
  status: ProjectCompatibilityStatus
  message: string
}

export type RawProject = {
  id?: string | null
  title?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  settings?: {
    uiKitId?: string | null
    uiMode?: string | null
  } | null
  uiKitId?: string | null
  uiMode?: string | null
}

const DEFAULT_PROJECT_UI_MODE: ProjectUiMode = "ui-kit"
const DEFAULT_PROJECT_TIMESTAMP = "1970-01-01T00:00:00.000Z"

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
  /(?:from\s+|import\s+)["']@\/components\/ui\//,
  /(?:from\s+|import\s+)["']antd(?:["']|\/)/,
  /(?:from\s+|import\s+)["']@mui\//,
  /(?:from\s+|import\s+)["']lucide-react(?:["']|\/)/,
  /(?:from\s+|import\s+)["']@radix-ui\//,
]
const shadcnImportPattern = /(?:from\s+|import\s+)["']@\/components\/ui\//

function normalizeProjectUiMode(rawUiMode?: string | null): ProjectUiMode {
  const raw = rawUiMode?.trim().toLowerCase()
  if (!raw) return DEFAULT_PROJECT_UI_MODE
  if (raw === "ui-kit" || raw === "uikit" || raw === "kit" || raw === "components") return "ui-kit"
  if (raw === "html" || raw === "html-tags" || raw === "native" || raw === "none") return "html-tags"
  return DEFAULT_PROJECT_UI_MODE
}

function normalizeProjectTimestamp(rawTimestamp: string | null | undefined, fallback = DEFAULT_PROJECT_TIMESTAMP) {
  if (typeof rawTimestamp !== "string" || !rawTimestamp.trim()) return fallback
  const date = new Date(rawTimestamp)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toISOString()
}

function createProjectTimestamp() {
  return new Date().toISOString()
}

function createDefaultProject(id = "lab-local-project"): Project {
  const now = createProjectTimestamp()

  return {
    id,
    title: "Локальный проект",
    createdAt: now,
    updatedAt: now,
    settings: {
      uiKitId: DEFAULT_SANDPACK_UI_KIT_ID,
      uiMode: DEFAULT_PROJECT_UI_MODE,
    },
  }
}

function normalizeProject(rawProject: RawProject | null | undefined): Project {
  const fallback = createDefaultProject(rawProject?.id || undefined)
  const rawSettings = rawProject?.settings ?? null
  const rawUiKitId = rawSettings?.uiKitId ?? rawProject?.uiKitId
  const rawUiMode = rawSettings?.uiMode ?? rawProject?.uiMode
  const uiKitId = normalizeSandpackUiKitId(rawUiKitId)
  const uiMode = rawUiMode == null && uiKitId === "none"
    ? "html-tags"
    : normalizeProjectUiMode(rawUiMode)
  const createdAt = normalizeProjectTimestamp(rawProject?.createdAt, fallback.createdAt)

  return {
    id: typeof rawProject?.id === "string" && rawProject.id.trim() ? rawProject.id.trim() : fallback.id,
    title: typeof rawProject?.title === "string" && rawProject.title.trim() ? rawProject.title.trim() : fallback.title,
    createdAt,
    updatedAt: normalizeProjectTimestamp(rawProject?.updatedAt, createdAt),
    settings: {
      uiKitId,
      uiMode,
    },
  }
}

function serializeProjectWorkspace(project: RawProject | ProjectWorkspace): ProjectWorkspace {
  return normalizeProject(project)
}

function getProjectStorageKey(taskId: string) {
  return `desengine:project:${taskId}`
}

function findDisallowedJsxTag(componentSource: string) {
  const jsxTagPattern = /<\s*([A-Za-z][A-Za-z0-9._:-]*)\b/g
  const sourceWithoutTextLiterals = stripCodeTextLiterals(componentSource)
  let match: RegExpExecArray | null

  while ((match = jsxTagPattern.exec(sourceWithoutTextLiterals))) {
    const tagName = match[1]
    if (!tagName || tagName.includes(".")) return tagName
    if (tagName[0] === tagName[0].toUpperCase()) return tagName
    if (!allowedHtmlTagNames.has(tagName)) return tagName
  }

  return null
}

function stripCodeTextLiterals(source: string) {
  let result = ""
  let index = 0
  let state: "code" | "single" | "double" | "template" | "line-comment" | "block-comment" = "code"

  while (index < source.length) {
    const char = source[index]
    const nextChar = source[index + 1]

    if (state === "code") {
      if (char === "'" || char === '"' || char === "`") {
        state = char === "'" ? "single" : char === '"' ? "double" : "template"
        result += " "
      } else if (char === "/" && nextChar === "/") {
        state = "line-comment"
        result += "  "
        index += 1
      } else if (char === "/" && nextChar === "*") {
        state = "block-comment"
        result += "  "
        index += 1
      } else {
        result += char
      }
      index += 1
      continue
    }

    if (state === "line-comment") {
      if (char === "\n") {
        state = "code"
        result += "\n"
      } else {
        result += " "
      }
      index += 1
      continue
    }

    if (state === "block-comment") {
      if (char === "*" && nextChar === "/") {
        state = "code"
        result += "  "
        index += 2
      } else {
        result += char === "\n" ? "\n" : " "
        index += 1
      }
      continue
    }

    const quote = state === "single" ? "'" : state === "double" ? '"' : "`"
    if (char === "\\") {
      result += "  "
      index += 2
    } else if (char === quote) {
      state = "code"
      result += " "
      index += 1
    } else {
      result += char === "\n" ? "\n" : " "
      index += 1
    }
  }

  return result
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

function validateUiKitComponentSource(componentSource: string, uiKitId: SandpackUiKitId): ProjectCompatibility {
  if (uiKitId !== "shadcn" && shadcnImportPattern.test(componentSource)) {
    return {
      status: "incompatible",
      message: `Проект с UI kit ${uiKitId} не подключает imports из components/ui: переключите проект на shadcn или уберите shadcn-компоненты.`,
    }
  }

  return {
    status: "compatible",
    message: "Режим проекта совместим с выбранным UI kit.",
  }
}

function resolveProjectPreviewConfig(project: Project) {
  return {
    ...project,
    effectiveUiKitId: project.settings.uiMode === "html-tags" ? "none" : project.settings.uiKitId,
  }
}

export {
  DEFAULT_PROJECT_UI_MODE,
  allowedHtmlTagNames,
  createDefaultProject,
  getProjectStorageKey,
  normalizeProject,
  normalizeProjectUiMode,
  serializeProjectWorkspace,
  resolveProjectPreviewConfig,
  validateUiKitComponentSource,
  validateHtmlTagsComponentSource,
}
