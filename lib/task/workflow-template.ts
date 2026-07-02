import type { ProjectComponentWorkflowKind } from "@/lib/project/component-runtime"

const COMPONENT_WORKFLOW_SESSION_TASK_ID = "component-workflow"

const workflowTemplateRegistry = {
  "image-to-component-workflow": {
    sessionTaskId: COMPONENT_WORKFLOW_SESSION_TASK_ID,
    templateTaskId: "easy-buy-app-badge",
  },
} as const satisfies Record<ProjectComponentWorkflowKind, {
  sessionTaskId: string
  templateTaskId: string
}>

function resolveWorkflowSessionTaskId(workflowKind: ProjectComponentWorkflowKind) {
  return workflowTemplateRegistry[workflowKind].sessionTaskId
}

function resolveWorkflowTemplateTaskIdByKind(workflowKind: ProjectComponentWorkflowKind) {
  return workflowTemplateRegistry[workflowKind].templateTaskId
}

function resolveTaskCatalogSourceId(taskId: string) {
  const workflowEntry = Object.values(workflowTemplateRegistry).find((entry) => entry.sessionTaskId === taskId)
  return workflowEntry?.templateTaskId ?? taskId
}

export {
  COMPONENT_WORKFLOW_SESSION_TASK_ID,
  resolveTaskCatalogSourceId,
  resolveWorkflowSessionTaskId,
  resolveWorkflowTemplateTaskIdByKind,
}
