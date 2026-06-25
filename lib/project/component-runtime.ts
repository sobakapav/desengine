export type ProjectComponentStatus = "draft" | "in_progress" | "completed"
export type ProjectComponentWorkflowKind = "image-to-component-workflow"

export type ProjectComponent = {
  id: string
  projectId: string
  title: string
  taskId: string | null
  workflowKind: ProjectComponentWorkflowKind
  status: ProjectComponentStatus
  createdAt: string
  updatedAt: string
}

export type CreateProjectComponentInput = {
  id?: string | null
  projectId: string
  title?: string | null
  workflowKind?: ProjectComponentWorkflowKind | null
}

type RawProjectComponent = {
  id?: string | null
  projectId?: string | null
  title?: string | null
  taskId?: string | null
  workflowKind?: string | null
  status?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

const DEFAULT_COMPONENT_TIMESTAMP = "1970-01-01T00:00:00.000Z"

function createProjectComponentTimestamp() {
  return new Date().toISOString()
}

function createProjectComponentId() {
  return `component-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function normalizeProjectComponentTimestamp(rawTimestamp: string | null | undefined, fallback = DEFAULT_COMPONENT_TIMESTAMP) {
  if (typeof rawTimestamp !== "string" || !rawTimestamp.trim()) return fallback
  const date = new Date(rawTimestamp)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toISOString()
}

function normalizeProjectComponentStatus(rawStatus?: string | null): ProjectComponentStatus {
  if (rawStatus === "in_progress" || rawStatus === "completed") {
    return rawStatus
  }

  return "draft"
}

function normalizeProjectComponentWorkflowKind(rawKind?: string | null): ProjectComponentWorkflowKind {
  return rawKind === "image-to-component-workflow"
    ? rawKind
    : "image-to-component-workflow"
}

function normalizeProjectComponent(rawComponent: RawProjectComponent | null | undefined): ProjectComponent {
  const now = createProjectComponentTimestamp()
  const createdAt = normalizeProjectComponentTimestamp(rawComponent?.createdAt, now)

  return {
    id: typeof rawComponent?.id === "string" && rawComponent.id.trim()
      ? rawComponent.id.trim()
      : createProjectComponentId(),
    projectId: typeof rawComponent?.projectId === "string" ? rawComponent.projectId.trim() : "",
    title: typeof rawComponent?.title === "string" && rawComponent.title.trim()
      ? rawComponent.title.trim()
      : "Новый компонент",
    taskId: typeof rawComponent?.taskId === "string" && rawComponent.taskId.trim()
      ? rawComponent.taskId.trim()
      : null,
    workflowKind: normalizeProjectComponentWorkflowKind(rawComponent?.workflowKind),
    status: normalizeProjectComponentStatus(rawComponent?.status),
    createdAt,
    updatedAt: normalizeProjectComponentTimestamp(rawComponent?.updatedAt, createdAt),
  }
}

function createProjectComponent(input: CreateProjectComponentInput): ProjectComponent {
  const now = createProjectComponentTimestamp()

  return normalizeProjectComponent({
    id: typeof input.id === "string" && input.id.trim() ? input.id.trim() : createProjectComponentId(),
    projectId: input.projectId,
    title: typeof input.title === "string" && input.title.trim() ? input.title.trim() : "Новый компонент",
    taskId: null,
    workflowKind: input.workflowKind ?? "image-to-component-workflow",
    status: "draft",
    createdAt: now,
    updatedAt: now,
  })
}

export {
  createProjectComponent,
  normalizeProjectComponent,
}
