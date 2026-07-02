export const EVENT_PAYLOAD_FAMILIES = ["experience", "action", "cost"] as const

export const EVENT_PRIVACY_CLASSES = ["local", "sensitive", "secret-adjacent"] as const

export const EVENT_REDACTION_STATES = ["raw", "redacted", "metadata-only"] as const

export const EVENT_SCOPE_KINDS = ["project", "workflow-step", "workbench-instance"] as const

export type EventPayloadFamily = (typeof EVENT_PAYLOAD_FAMILIES)[number]

export type EventPrivacyClass = (typeof EVENT_PRIVACY_CLASSES)[number]

export type EventRedactionState = (typeof EVENT_REDACTION_STATES)[number]

export type EventScopeKind = (typeof EVENT_SCOPE_KINDS)[number]

export type EventKind = `${EventPayloadFamily}.${string}`

export type ProjectEventScope = {
  projectId: string
  workflowStepId?: never
  workbenchInstanceId?: never
}

export type WorkflowStepEventScope = {
  projectId: string
  workflowStepId: string
  workbenchInstanceId?: never
}

export type WorkbenchInstanceEventScope = {
  projectId: string
  workflowStepId?: never
  workbenchInstanceId: string
}

export type EventScope =
  | ProjectEventScope
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

/**
 * @example
 * ```ts
 * const scope = createWorkflowStepEventScope("project-a", "step-a")
 * ```
 */
export function createWorkflowStepEventScope(
  projectId = "project-1",
  workflowStepId = "workflow-step-1",
): WorkflowStepEventScope {
  return {
    projectId,
    workflowStepId,
  }
}

/**
 * @example
 * ```ts
 * const scope = createWorkbenchInstanceEventScope("project-a", "workbench-a")
 * ```
 */
export function createWorkbenchInstanceEventScope(
  projectId = "project-1",
  workbenchInstanceId = "workbench-1",
): WorkbenchInstanceEventScope {
  return {
    projectId,
    workbenchInstanceId,
  }
}
