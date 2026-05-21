export const EVENT_PAYLOAD_FAMILIES = ["experience", "action", "cost"] as const

export const EVENT_PRIVACY_CLASSES = ["local", "sensitive", "secret-adjacent"] as const

export const EVENT_REDACTION_STATES = ["raw", "redacted", "metadata-only"] as const

export const EVENT_SCOPE_KINDS = ["project", "task", "workflow-step", "workbench-instance"] as const

export type EventPayloadFamily = (typeof EVENT_PAYLOAD_FAMILIES)[number]

export type EventPrivacyClass = (typeof EVENT_PRIVACY_CLASSES)[number]

export type EventRedactionState = (typeof EVENT_REDACTION_STATES)[number]

export type EventScopeKind = (typeof EVENT_SCOPE_KINDS)[number]

export type EventKind = `${EventPayloadFamily}.${string}`

export type ProjectEventScope = {
  projectId: string
  taskId?: never
  workflowStepId?: never
  workbenchInstanceId?: never
}

export type TaskEventScope = {
  projectId: string
  taskId: string
  workflowStepId?: never
  workbenchInstanceId?: never
}

export type WorkflowStepEventScope = {
  projectId: string
  taskId: string
  workflowStepId: string
  workbenchInstanceId?: never
}

export type WorkbenchInstanceEventScope = {
  projectId: string
  taskId?: never
  workflowStepId?: never
  workbenchInstanceId: string
}

export type EventScope =
  | ProjectEventScope
  | TaskEventScope
  | WorkflowStepEventScope
  | WorkbenchInstanceEventScope

export type EventPayload = {
  family: EventPayloadFamily
} & Record<string, unknown>

export type EventEnvelope<TPayload extends EventPayload = EventPayload> = {
  eventId: string
  kind: EventKind
  occurredAt: string
  scope: EventScope
  privacyClass: EventPrivacyClass
  redactionState: EventRedactionState
  payload: TPayload
}

export function createProjectEventScope(projectId = "project-1"): ProjectEventScope {
  return {
    projectId,
  }
}

export function createTaskEventScope(projectId = "project-1", taskId = "task-1"): TaskEventScope {
  return {
    projectId,
    taskId,
  }
}

export function createWorkflowStepEventScope(
  projectId = "project-1",
  taskId = "task-1",
  workflowStepId = "workflow-step-1",
): WorkflowStepEventScope {
  return {
    projectId,
    taskId,
    workflowStepId,
  }
}

export function createWorkbenchInstanceEventScope(
  projectId = "project-1",
  workbenchInstanceId = "workbench-1",
): WorkbenchInstanceEventScope {
  return {
    projectId,
    workbenchInstanceId,
  }
}
