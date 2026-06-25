import {
  DEFAULT_SANDPACK_UI_KIT_ID,
  normalizeSandpackUiKitId,
  type SandpackUiKitId,
} from "@/lib/lab/sandpack-ui-kits.config"

export type ProjectSettings = {
  uiKitId: SandpackUiKitId
}

export type ProjectMigrationState = "idle" | "pending" | "completed" | "failed"
export type ProjectMigrationInvalidationScope = "none" | "current-level"

export type ProjectMigrationStatus = {
  state: ProjectMigrationState
  sourceUiKitId: SandpackUiKitId
  targetUiKitId: SandpackUiKitId
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
  } | null
  uiKitId?: string | null
}

export type ProjectCompatibilityStatus = "compatible" | "incompatible"

export type ProjectCompatibility = {
  status: ProjectCompatibilityStatus
  message: string
}

export type ProjectMigrationTarget = {
  uiKitId: SandpackUiKitId
}

export type RawProjectMigrationTarget = {
  uiKitId?: string | null
} | null | undefined

export type RawProject = {
  id?: string | null
  title?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  settings?: {
    uiKitId?: string | null
  } | null
  uiKitId?: string | null
  migration?: {
    state?: string | null
    sourceUiKitId?: string | null
    targetUiKitId?: string | null
    invalidationScope?: string | null
    requiresReplay?: boolean | null
    message?: string | null
    startedAt?: string | null
    finishedAt?: string | null
  } | null
}

const DEFAULT_PROJECT_TIMESTAMP = "1970-01-01T00:00:00.000Z"
const shadcnImportPattern = /(?:from\s+|import\s+)["']@\/components\/ui\//

function normalizeProjectTimestamp(rawTimestamp: string | null | undefined, fallback = DEFAULT_PROJECT_TIMESTAMP) {
  if (typeof rawTimestamp !== "string" || !rawTimestamp.trim()) return fallback
  const date = new Date(rawTimestamp)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toISOString()
}

function normalizeOptionalProjectTimestamp(rawTimestamp: string | null | undefined) {
  if (typeof rawTimestamp !== "string" || !rawTimestamp.trim()) return null

  return normalizeProjectTimestamp(rawTimestamp)
}

function createProjectTimestamp() {
  return new Date().toISOString()
}

function createProjectWorkspaceId() {
  return `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function createIdleProjectMigrationStatus(settings: ProjectSettings): ProjectMigrationStatus {
  return {
    state: "idle",
    sourceUiKitId: settings.uiKitId,
    targetUiKitId: settings.uiKitId,
    invalidationScope: "none",
    requiresReplay: false,
    message: "",
    startedAt: null,
    finishedAt: null,
  }
}

function createDefaultProject(id = "lab-local-project"): Project {
  const now = createProjectTimestamp()
  const settings = {
    uiKitId: DEFAULT_SANDPACK_UI_KIT_ID,
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

  return {
    state: normalizeProjectMigrationState(rawMigration.state),
    sourceUiKitId: normalizeSandpackUiKitId(rawMigration.sourceUiKitId ?? settings.uiKitId),
    targetUiKitId: normalizeSandpackUiKitId(rawMigration.targetUiKitId ?? settings.uiKitId),
    invalidationScope: normalizeProjectMigrationInvalidationScope(rawMigration.invalidationScope),
    requiresReplay: Boolean(rawMigration.requiresReplay),
    message: typeof rawMigration.message === "string" ? rawMigration.message.trim() : "",
    startedAt: normalizeOptionalProjectTimestamp(rawMigration.startedAt),
    finishedAt: normalizeOptionalProjectTimestamp(rawMigration.finishedAt),
  }
}

function normalizeProject(rawProject: RawProject | null | undefined): Project {
  const fallback = createDefaultProject(rawProject?.id || undefined)
  const rawSettings = rawProject?.settings ?? null
  const rawUiKitId = rawSettings?.uiKitId ?? rawProject?.uiKitId
  const uiKitId = normalizeSandpackUiKitId(rawUiKitId)
  const createdAt = normalizeProjectTimestamp(rawProject?.createdAt, fallback.createdAt)
  const settings = { uiKitId } satisfies ProjectSettings

  return {
    id: typeof rawProject?.id === "string" && rawProject.id.trim() ? rawProject.id.trim() : fallback.id,
    title: typeof rawProject?.title === "string" && rawProject.title.trim() ? rawProject.title.trim() : fallback.title,
    createdAt,
    updatedAt: normalizeProjectTimestamp(rawProject?.updatedAt, createdAt),
    settings,
    migration: normalizeProjectMigrationStatus(rawProject?.migration, settings),
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
  })
}

function serializeProjectWorkspace(project: RawProject | ProjectWorkspace): ProjectWorkspace {
  return normalizeProject(project)
}

function getProjectStorageKey(taskId: string) {
  return `desengine:project:${taskId}`
}

function getProjectMigrationTarget(nextUiKitId: SandpackUiKitId): ProjectMigrationTarget {
  return {
    uiKitId: nextUiKitId,
  }
}

function normalizeProjectMigrationTarget(rawTarget: RawProjectMigrationTarget): ProjectMigrationTarget {
  return {
    uiKitId: normalizeSandpackUiKitId(rawTarget?.uiKitId),
  }
}

function projectNeedsUiKitMigration(project: Project, target: ProjectMigrationTarget) {
  return project.settings.uiKitId !== target.uiKitId
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
      targetUiKitId: target.uiKitId,
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
    },
    migration: {
      state: "completed",
      sourceUiKitId: project.settings.uiKitId,
      targetUiKitId: target.uiKitId,
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
      targetUiKitId: target.uiKitId,
      invalidationScope: "none",
      requiresReplay: false,
      message,
      startedAt: project.migration.startedAt ?? now,
      finishedAt: now,
    },
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
    message: "Проект совместим с выбранным UI kit.",
  }
}

function resolveProjectPreviewConfig(project: Project) {
  return {
    ...project,
    effectiveUiKitId: project.settings.uiKitId,
  }
}

export {
  createProjectWorkspace,
  createDefaultProject,
  getProjectStorageKey,
  getProjectMigrationTarget,
  normalizeProject,
  normalizeProjectMigrationTarget,
  normalizeProjectMigrationStatus,
  projectNeedsUiKitMigration,
  serializeProjectWorkspace,
  startProjectUiKitMigration,
  completeProjectUiKitMigration,
  failProjectUiKitMigration,
  resolveProjectPreviewConfig,
  validateUiKitComponentSource,
}
