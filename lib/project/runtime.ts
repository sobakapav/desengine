import {
  DEFAULT_PROJECT_UI_KIT_ID,
  normalizeProjectUiKitId,
  type ProjectUiKitId,
} from "@/lib/project/ui-kit-config"
import {
  type ProjectCompatibility,
  type ProjectCompatibilityStatus,
  resolveProjectPreviewConfig,
  validateUiKitComponentSource,
} from "@/lib/project/compatibility"
import {
  createProjectTimestamp,
  createProjectWorkspaceId,
  normalizeOptionalProjectTimestamp,
  normalizeProjectTimestamp,
} from "@/lib/project/runtime-helpers"
import {
  createEmptyProjectMetadata,
  normalizeProjectMetadata,
  type ProjectMetadata,
  type RawProjectMetadata,
} from "@/lib/project/metadata-contract"

export type ProjectSettings = {
  uiKitId: ProjectUiKitId
  workflowTemplateId: "project-design-workflow"
  promptBrief: string
}

export type ProjectMigrationState = "idle" | "pending" | "completed" | "failed"
export type ProjectMigrationInvalidationScope = "none" | "current-step"

export type ProjectMigrationStatus = {
  state: ProjectMigrationState
  sourceUiKitId: ProjectUiKitId
  targetUiKitId: ProjectUiKitId
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
  metadata: ProjectMetadata
}

export type Project = ProjectWorkspace

export type CreateProjectWorkspaceInput = {
  code?: string | null
  id?: string | null
  rootPath?: string | null
  title?: string | null
  metadata?: RawProjectMetadata
  settings?: {
    promptBrief?: string | null
    uiKitId?: string | null
    workflowTemplateId?: string | null
  } | null
  promptBrief?: string | null
  uiKitId?: string | null
  workflowTemplateId?: string | null
}

export type ProjectMigrationTarget = {
  uiKitId: ProjectUiKitId
}

export type RawProjectMigrationTarget = {
  uiKitId?: string | null
} | null | undefined

export type RawProject = {
  id?: string | null
  title?: string | null
  createdAt?: string | null
  updatedAt?: string | null
  metadata?: RawProjectMetadata
  settings?: {
    promptBrief?: string | null
    uiKitId?: string | null
    workflowTemplateId?: string | null
  } | null
  promptBrief?: string | null
  uiKitId?: string | null
  workflowTemplateId?: string | null
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

function buildProjectMetadata(rawProject: RawProject | null | undefined, fallback: Project) {
  const metadata = normalizeProjectMetadata(rawProject?.metadata, {
    code: rawProject?.metadata?.code ?? rawProject?.id ?? fallback.id,
    title: rawProject?.metadata?.title ?? rawProject?.title ?? fallback.title,
    uiKitId: rawProject?.metadata?.uiKitId ?? rawProject?.settings?.uiKitId ?? rawProject?.uiKitId ?? fallback.settings.uiKitId,
  })

  return {
    ...metadata,
    title: typeof rawProject?.title === "string" && rawProject.title.trim() ? rawProject.title.trim() : metadata.title,
    code: metadata.code || (typeof rawProject?.id === "string" && rawProject.id.trim() ? rawProject.id.trim() : fallback.id),
    uiKitId: normalizeProjectUiKitId(rawProject?.settings?.uiKitId ?? rawProject?.uiKitId ?? metadata.uiKitId),
  }
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

function createDefaultProject(id = "project-local-workspace"): Project {
  const now = createProjectTimestamp()
  const settings = {
    uiKitId: DEFAULT_PROJECT_UI_KIT_ID,
    workflowTemplateId: "project-design-workflow",
    promptBrief: "",
  } satisfies ProjectSettings

  return {
    id,
    title: "Локальный проект",
    createdAt: now,
    updatedAt: now,
    settings,
    migration: createIdleProjectMigrationStatus(settings),
    metadata: createEmptyProjectMetadata(),
  }
}

function normalizeProjectMigrationState(rawState?: string | null): ProjectMigrationState {
  if (rawState === "pending" || rawState === "completed" || rawState === "failed") {
    return rawState
  }

  return "idle"
}

function normalizeProjectMigrationInvalidationScope(rawScope?: string | null): ProjectMigrationInvalidationScope {
  return rawScope === "current-step" ? "current-step" : "none"
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
    sourceUiKitId: normalizeProjectUiKitId(rawMigration.sourceUiKitId ?? settings.uiKitId),
    targetUiKitId: normalizeProjectUiKitId(rawMigration.targetUiKitId ?? settings.uiKitId),
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
  const uiKitId = normalizeProjectUiKitId(rawUiKitId)
  const createdAt = normalizeProjectTimestamp(rawProject?.createdAt, fallback.createdAt)
  const promptBrief = typeof rawSettings?.promptBrief === "string"
    ? rawSettings.promptBrief.trim()
    : typeof rawProject?.promptBrief === "string"
      ? rawProject.promptBrief.trim()
      : ""
  const settings = {
    uiKitId,
    workflowTemplateId: "project-design-workflow",
    promptBrief,
  } satisfies ProjectSettings

  return {
    id: typeof rawProject?.id === "string" && rawProject.id.trim() ? rawProject.id.trim() : fallback.id,
    title: typeof rawProject?.title === "string" && rawProject.title.trim() ? rawProject.title.trim() : fallback.title,
    createdAt,
    updatedAt: normalizeProjectTimestamp(rawProject?.updatedAt, createdAt),
    settings,
    migration: normalizeProjectMigrationStatus(rawProject?.migration, settings),
    metadata: buildProjectMetadata(rawProject, fallback),
  }
}

function createProjectWorkspace(input: CreateProjectWorkspaceInput = {}): ProjectWorkspace {
  const now = createProjectTimestamp()
  const title = typeof input.title === "string" && input.title.trim()
    ? input.title.trim()
    : "Новый проект"

  return normalizeProject({
    id: typeof input.id === "string" && input.id.trim()
      ? input.id.trim()
      : typeof input.code === "string" && input.code.trim()
        ? input.code.trim()
        : createProjectWorkspaceId(),
    title,
    createdAt: now,
    updatedAt: now,
    metadata: {
      ...input.metadata,
      code: typeof input.code === "string" && input.code.trim()
        ? input.code.trim()
        : typeof input.id === "string" && input.id.trim()
          ? input.id.trim()
          : input.metadata?.code,
      title,
      uiKitId: input.settings?.uiKitId ?? input.uiKitId ?? input.metadata?.uiKitId,
    },
    settings: input.settings,
    promptBrief: input.promptBrief,
    uiKitId: input.uiKitId,
    workflowTemplateId: input.workflowTemplateId,
  })
}

function serializeProjectWorkspace(project: RawProject | ProjectWorkspace): ProjectWorkspace {
  return normalizeProject(project)
}

function getProjectMigrationTarget(nextUiKitId: ProjectUiKitId): ProjectMigrationTarget {
  return {
    uiKitId: nextUiKitId,
  }
}

function normalizeProjectMigrationTarget(rawTarget: RawProjectMigrationTarget): ProjectMigrationTarget {
  return {
    uiKitId: normalizeProjectUiKitId(rawTarget?.uiKitId),
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
      workflowTemplateId: project.settings.workflowTemplateId,
      promptBrief: project.settings.promptBrief,
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

export {
  createProjectWorkspace,
  createDefaultProject,
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
