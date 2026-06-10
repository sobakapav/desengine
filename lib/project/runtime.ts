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

export type ProjectMigrationState = "idle" | "pending" | "completed" | "failed"
export type ProjectMigrationInvalidationScope = "none" | "current-level"

export type ProjectMigrationStatus = {
  state: ProjectMigrationState
  sourceUiKitId: SandpackUiKitId
  sourceUiMode: ProjectUiMode
  targetUiKitId: SandpackUiKitId
  targetUiMode: ProjectUiMode
  invalidationScope: ProjectMigrationInvalidationScope
  requiresReplay: boolean
  message: string
  startedAt: string | null
  finishedAt: string | null
}

export type ProjectWorkspace = {
  id: string
  title: string
  createdAt: string
  updatedAt: string
  settings: ProjectSettings
  migration: ProjectMigrationStatus
}

export type Project = ProjectWorkspace

export type CreateProjectWorkspaceInput = {
  id?: string | null
  title?: string | null
  settings?: {
    uiKitId?: string | null
    uiMode?: string | null
  } | null
  uiKitId?: string | null
  uiMode?: string | null
}

export type ProjectCompatibilityStatus = "compatible" | "incompatible"

export type ProjectCompatibility = {
  status: ProjectCompatibilityStatus
  message: string
}

export type ProjectMigrationTarget = {
  uiKitId: SandpackUiKitId
  uiMode: ProjectUiMode
}

export type RawProjectMigrationTarget = {
  uiKitId?: string | null
  uiMode?: string | null
} | null | undefined

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
  migration?: {
    state?: string | null
    sourceUiKitId?: string | null
    sourceUiMode?: string | null
    targetUiKitId?: string | null
    targetUiMode?: string | null
    invalidationScope?: string | null
    requiresReplay?: boolean | null
    message?: string | null
    startedAt?: string | null
    finishedAt?: string | null
  } | null
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

function createProjectWorkspaceId() {
  return `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function createDefaultProject(id = "lab-local-project"): Project {
  const now = createProjectTimestamp()
  const settings = {
    uiKitId: DEFAULT_SANDPACK_UI_KIT_ID,
    uiMode: DEFAULT_PROJECT_UI_MODE,
  } satisfies ProjectSettings

  return {
    id,
    title: "Локальный проект",
    createdAt: now,
    updatedAt: now,
    settings,
    migration: createIdleProjectMigrationStatus(settings),
  }
}

function createProjectWorkspace(input: CreateProjectWorkspaceInput = {}): ProjectWorkspace {
  const now = createProjectTimestamp()
  const title = typeof input.title === "string" && input.title.trim()
    ? input.title.trim()
    : "Новый проект"

  return normalizeProject({
    id: typeof input.id === "string" && input.id.trim() ? input.id.trim() : createProjectWorkspaceId(),
    title,
    createdAt: now,
    updatedAt: now,
    settings: input.settings,
    uiKitId: input.uiKitId,
    uiMode: input.uiMode,
  })
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
    migration: normalizeProjectMigrationStatus(rawProject?.migration, {
      uiKitId,
      uiMode,
    }),
  }
}

function serializeProjectWorkspace(project: RawProject | ProjectWorkspace): ProjectWorkspace {
  return normalizeProject(project)
}

function getProjectStorageKey(taskId: string) {
  return `desengine:project:${taskId}`
}

function createIdleProjectMigrationStatus(settings: ProjectSettings): ProjectMigrationStatus {
  return {
    state: "idle",
    sourceUiKitId: settings.uiKitId,
    sourceUiMode: settings.uiMode,
    targetUiKitId: settings.uiKitId,
    targetUiMode: settings.uiMode,
    invalidationScope: "none",
    requiresReplay: false,
    message: "",
    startedAt: null,
    finishedAt: null,
  }
}

function normalizeProjectMigrationState(rawState?: string | null): ProjectMigrationState {
  if (rawState === "pending" || rawState === "completed" || rawState === "failed") {
    return rawState
  }

  return "idle"
}

function normalizeProjectMigrationInvalidationScope(rawScope?: string | null): ProjectMigrationInvalidationScope {
  return rawScope === "current-level" ? "current-level" : "none"
}

function normalizeProjectMigrationStatus(
  rawMigration: RawProject["migration"],
  settings: ProjectSettings,
): ProjectMigrationStatus {
  const fallback = createIdleProjectMigrationStatus(settings)

  if (!rawMigration || typeof rawMigration !== "object") {
    return fallback
  }

  const state = normalizeProjectMigrationState(rawMigration.state)
  const sourceUiKitId = normalizeSandpackUiKitId(rawMigration.sourceUiKitId ?? settings.uiKitId)
  const sourceUiMode = normalizeProjectUiMode(rawMigration.sourceUiMode ?? settings.uiMode)
  const targetUiKitId = normalizeSandpackUiKitId(rawMigration.targetUiKitId ?? settings.uiKitId)
  const targetUiMode = normalizeProjectUiMode(rawMigration.targetUiMode ?? settings.uiMode)

  return {
    state,
    sourceUiKitId,
    sourceUiMode,
    targetUiKitId,
    targetUiMode,
    invalidationScope: normalizeProjectMigrationInvalidationScope(rawMigration.invalidationScope),
    requiresReplay: Boolean(rawMigration.requiresReplay),
    message: typeof rawMigration.message === "string" ? rawMigration.message.trim() : "",
    startedAt: normalizeOptionalProjectTimestamp(rawMigration.startedAt),
    finishedAt: normalizeOptionalProjectTimestamp(rawMigration.finishedAt),
  }
}

function normalizeOptionalProjectTimestamp(rawTimestamp: string | null | undefined) {
  if (typeof rawTimestamp !== "string" || !rawTimestamp.trim()) return null

  return normalizeProjectTimestamp(rawTimestamp)
}

function getProjectMigrationTarget(nextUiKitId: SandpackUiKitId): ProjectMigrationTarget {
  return {
    uiKitId: nextUiKitId,
    uiMode: nextUiKitId === "none" ? "html-tags" : "ui-kit",
  }
}

function normalizeProjectMigrationTarget(rawTarget: RawProjectMigrationTarget): ProjectMigrationTarget {
  const uiKitId = normalizeSandpackUiKitId(rawTarget?.uiKitId)
  const fallbackTarget = getProjectMigrationTarget(uiKitId)

  return {
    uiKitId,
    uiMode: rawTarget?.uiMode == null
      ? fallbackTarget.uiMode
      : normalizeProjectUiMode(rawTarget.uiMode),
  }
}

function projectNeedsUiKitMigration(project: Project, target: ProjectMigrationTarget) {
  return (
    project.settings.uiKitId !== target.uiKitId
    || project.settings.uiMode !== target.uiMode
  )
}

function startProjectUiKitMigration(project: Project, target: ProjectMigrationTarget): Project {
  if (!projectNeedsUiKitMigration(project, target)) {
    return {
      ...project,
      migration: createIdleProjectMigrationStatus(project.settings),
    }
  }

  return {
    ...project,
    migration: {
      state: "pending",
      sourceUiKitId: project.settings.uiKitId,
      sourceUiMode: project.settings.uiMode,
      targetUiKitId: target.uiKitId,
      targetUiMode: target.uiMode,
      invalidationScope: "none",
      requiresReplay: false,
      message: `Готовим migration проекта с ${project.settings.uiKitId} на ${target.uiKitId}.`,
      startedAt: createProjectTimestamp(),
      finishedAt: null,
    },
  }
}

function completeProjectUiKitMigration(
  project: Project,
  target: ProjectMigrationTarget,
  options: {
    invalidationScope: ProjectMigrationInvalidationScope
    message: string
    requiresReplay: boolean
  },
): Project {
  const now = createProjectTimestamp()

  return {
    ...project,
    updatedAt: now,
    settings: {
      uiKitId: target.uiKitId,
      uiMode: target.uiMode,
    },
    migration: {
      state: "completed",
      sourceUiKitId: project.settings.uiKitId,
      sourceUiMode: project.settings.uiMode,
      targetUiKitId: target.uiKitId,
      targetUiMode: target.uiMode,
      invalidationScope: options.invalidationScope,
      requiresReplay: options.requiresReplay,
      message: options.message,
      startedAt: project.migration.startedAt ?? now,
      finishedAt: now,
    },
  }
}

function failProjectUiKitMigration(
  project: Project,
  target: ProjectMigrationTarget,
  message: string,
): Project {
  const now = createProjectTimestamp()

  return {
    ...project,
    migration: {
      state: "failed",
      sourceUiKitId: project.settings.uiKitId,
      sourceUiMode: project.settings.uiMode,
      targetUiKitId: target.uiKitId,
      targetUiMode: target.uiMode,
      invalidationScope: "none",
      requiresReplay: false,
      message,
      startedAt: project.migration.startedAt ?? now,
      finishedAt: now,
    },
  }
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
  createProjectWorkspace,
  DEFAULT_PROJECT_UI_MODE,
  allowedHtmlTagNames,
  createDefaultProject,
  getProjectStorageKey,
  getProjectMigrationTarget,
  normalizeProject,
  normalizeProjectMigrationTarget,
  normalizeProjectMigrationStatus,
  normalizeProjectUiMode,
  projectNeedsUiKitMigration,
  serializeProjectWorkspace,
  startProjectUiKitMigration,
  completeProjectUiKitMigration,
  failProjectUiKitMigration,
  resolveProjectPreviewConfig,
  validateUiKitComponentSource,
  validateHtmlTagsComponentSource,
}
