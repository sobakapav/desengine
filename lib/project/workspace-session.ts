import type {
  ProjectComponent,
  ProjectComponentStatus,
} from "@/lib/project/component-runtime"

type ProjectSessionStatus = "idle" | "in_progress" | "completed"
type ProjectWorkflowStageStatus = "not_started" | "in_progress" | "completed"
type ProjectWorkflowStageId =
  | "project-structure"
  | "project-focus"
  | "component-delivery"
  | "project-review"

type ProjectSession = {
  projectId: string
  workflowKind: "project-design-workflow"
  status: ProjectSessionStatus
  activeComponentId: string | null
  createdAt: string
  updatedAt: string
  lastActivityAt: string | null
}

type RawProjectSession = Partial<ProjectSession> | null | undefined

type ProjectActivityKind =
  | "project-session-started"
  | "project-component-created"
  | "project-focus-set"
  | "project-focus-cleared"
  | "project-component-completed"
  | "project-component-reopened"

type ProjectWorkspaceActivity = {
  id: string
  projectId: string
  kind: ProjectActivityKind
  createdAt: string
  componentId: string | null
  componentTitle: string | null
  message: string
}

type RawProjectWorkspaceActivity = Partial<ProjectWorkspaceActivity> | null | undefined

type ProjectWorkflowStage = {
  id: ProjectWorkflowStageId
  title: string
  description: string
  status: ProjectWorkflowStageStatus
}

const DEFAULT_TIMESTAMP = "1970-01-01T00:00:00.000Z"

function createTimestamp() {
  return new Date().toISOString()
}

function normalizeTimestamp(value: string | null | undefined, fallback = DEFAULT_TIMESTAMP) {
  if (typeof value !== "string" || !value.trim()) return fallback
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toISOString()
}

function normalizeOptionalTimestamp(value: string | null | undefined) {
  if (typeof value !== "string" || !value.trim()) return null
  return normalizeTimestamp(value)
}

function createProjectSession(projectId: string): ProjectSession {
  const now = createTimestamp()

  return {
    projectId: projectId.trim(),
    workflowKind: "project-design-workflow",
    status: "idle",
    activeComponentId: null,
    createdAt: now,
    updatedAt: now,
    lastActivityAt: null,
  }
}

function normalizeProjectSession(rawSession: RawProjectSession, projectId: string): ProjectSession {
  const fallback = createProjectSession(projectId)

  return {
    projectId: typeof rawSession?.projectId === "string" && rawSession.projectId.trim()
      ? rawSession.projectId.trim()
      : fallback.projectId,
    workflowKind: "project-design-workflow",
    status: rawSession?.status === "in_progress" || rawSession?.status === "completed"
      ? rawSession.status
      : "idle",
    activeComponentId: typeof rawSession?.activeComponentId === "string" && rawSession.activeComponentId.trim()
      ? rawSession.activeComponentId.trim()
      : null,
    createdAt: normalizeTimestamp(rawSession?.createdAt, fallback.createdAt),
    updatedAt: normalizeTimestamp(rawSession?.updatedAt, fallback.updatedAt),
    lastActivityAt: normalizeOptionalTimestamp(rawSession?.lastActivityAt),
  }
}

function touchProjectSession(session: ProjectSession, patch: Partial<ProjectSession> = {}): ProjectSession {
  const now = createTimestamp()

  return normalizeProjectSession({
    ...session,
    ...patch,
    updatedAt: now,
    lastActivityAt: patch.lastActivityAt ?? now,
  }, session.projectId)
}

function createProjectWorkspaceActivity(args: {
  componentId?: string | null
  componentTitle?: string | null
  kind: ProjectActivityKind
  message: string
  projectId: string
}) {
  return {
    id: `project-activity-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    projectId: args.projectId,
    kind: args.kind,
    createdAt: createTimestamp(),
    componentId: args.componentId?.trim() || null,
    componentTitle: args.componentTitle?.trim() || null,
    message: args.message.trim(),
  } satisfies ProjectWorkspaceActivity
}

function normalizeProjectWorkspaceActivity(
  rawActivity: RawProjectWorkspaceActivity,
  fallbackProjectId: string,
): ProjectWorkspaceActivity | null {
  if (!rawActivity || typeof rawActivity !== "object") {
    return null
  }

  const projectId = typeof rawActivity.projectId === "string" && rawActivity.projectId.trim()
    ? rawActivity.projectId.trim()
    : fallbackProjectId

  const message = typeof rawActivity.message === "string" ? rawActivity.message.trim() : ""
  if (!message) {
    return null
  }

  return {
    id: typeof rawActivity.id === "string" && rawActivity.id.trim()
      ? rawActivity.id.trim()
      : `project-activity-${projectId}-${Math.random().toString(36).slice(2, 8)}`,
    projectId,
    kind: rawActivity.kind === "project-session-started"
      || rawActivity.kind === "project-component-created"
      || rawActivity.kind === "project-focus-set"
      || rawActivity.kind === "project-focus-cleared"
      || rawActivity.kind === "project-component-completed"
      || rawActivity.kind === "project-component-reopened"
      ? rawActivity.kind
      : "project-session-started",
    createdAt: normalizeTimestamp(rawActivity.createdAt),
    componentId: typeof rawActivity.componentId === "string" && rawActivity.componentId.trim()
      ? rawActivity.componentId.trim()
      : null,
    componentTitle: typeof rawActivity.componentTitle === "string" && rawActivity.componentTitle.trim()
      ? rawActivity.componentTitle.trim()
      : null,
    message,
  }
}

function listProjectWorkflowStages(args: {
  activeComponent: ProjectComponent | null
  componentCount: number
  completedComponentCount: number
  sessionStatus: ProjectSessionStatus
}) {
  const structureStatus: ProjectWorkflowStageStatus =
    args.componentCount > 0
      ? "completed"
      : args.sessionStatus === "idle"
        ? "not_started"
        : "in_progress"

  const focusStatus: ProjectWorkflowStageStatus =
    args.activeComponent
      ? "completed"
      : args.componentCount > 0
        ? "in_progress"
        : "not_started"

  const deliveryStatus: ProjectWorkflowStageStatus =
    args.completedComponentCount > 0
      ? "completed"
      : args.activeComponent
        ? "in_progress"
        : args.componentCount > 0
          ? "in_progress"
          : "not_started"

  const reviewStatus: ProjectWorkflowStageStatus =
    args.componentCount > 0 && args.completedComponentCount === args.componentCount
      ? "completed"
      : args.completedComponentCount > 0
        ? "in_progress"
        : "not_started"

  return [
    {
      id: "project-structure",
      title: "Собрать состав проекта",
      description: "Проект получает набор компонентов, с которыми реально можно работать дальше.",
      status: structureStatus,
    },
    {
      id: "project-focus",
      title: "Выбрать текущий фокус проекта",
      description: "Проект удерживает один явный рабочий фокус, вместо разрозненных переходов по задачам.",
      status: focusStatus,
    },
    {
      id: "component-delivery",
      title: args.activeComponent
        ? `Довести компонент «${args.activeComponent.title}»`
        : "Довести текущий компонент",
      description: "Компонент остаётся частью проектной работы, а не отдельной изолированной сущностью.",
      status: deliveryStatus,
    },
    {
      id: "project-review",
      title: "Собрать проект в согласованную систему",
      description: "Проект завершает волну, когда компоненты начинают работать как единая кодовая дизайн-система.",
      status: reviewStatus,
    },
  ] satisfies ProjectWorkflowStage[]
}

function resolveProjectSessionStatus(args: {
  componentCount: number
  completedComponentCount: number
  activeComponentStatus: ProjectComponentStatus | null
  storedStatus: ProjectSessionStatus
}) {
  if (args.componentCount > 0 && args.completedComponentCount === args.componentCount) {
    return "completed" satisfies ProjectSessionStatus
  }

  if (args.storedStatus === "in_progress" || args.componentCount > 0 || args.activeComponentStatus === "in_progress") {
    return "in_progress" satisfies ProjectSessionStatus
  }

  return "idle" satisfies ProjectSessionStatus
}

function pickLatestActivityTimestamp(activities: ProjectWorkspaceActivity[], components: ProjectComponent[]) {
  return [
    ...activities.map((activity) => activity.createdAt),
    ...components.map((component) => component.updatedAt),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .sort((left, right) => right.localeCompare(left))[0] ?? null
}

export {
  createProjectSession,
  createProjectWorkspaceActivity,
  listProjectWorkflowStages,
  normalizeProjectSession,
  normalizeProjectWorkspaceActivity,
  pickLatestActivityTimestamp,
  resolveProjectSessionStatus,
  touchProjectSession,
}

export type {
  ProjectActivityKind,
  ProjectSession,
  ProjectSessionStatus,
  ProjectWorkflowStage,
  ProjectWorkflowStageId,
  ProjectWorkflowStageStatus,
  ProjectWorkspaceActivity,
  RawProjectSession,
  RawProjectWorkspaceActivity,
}
