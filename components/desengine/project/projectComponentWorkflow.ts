import type { ProjectComponent } from "@/lib/project/component-runtime"
import { resolveWorkflowSessionTaskId, resolveWorkflowTemplateTaskIdByKind } from "@/lib/task/workflow-template"

type ProjectWorkflowTaskCatalogItem = {
  taskId: string
  taskTitle: string
}

function resolveWorkflowTemplateTaskId(
  workflowKind: ProjectComponent["workflowKind"],
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[],
) {
  const templateTaskId = resolveWorkflowTemplateTaskIdByKind(workflowKind)
  const matchedTask = workflowTaskCatalog.find((task) => task.taskId === templateTaskId)
  return matchedTask ? resolveWorkflowSessionTaskId(workflowKind) : null
}

/**
 * @example
 * ```ts
 * const taskId = resolveProjectComponentTaskId({
 *   component,
 *   workflowTaskCatalog: [{ taskId: "easy-buy-app-badge", taskTitle: "Easy Buy App Badge" }],
 * })
 * ```
 */
function resolveProjectComponentTaskId(args: {
  component: ProjectComponent
  projectTitle?: string | null
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
}) {
  if (args.component.taskId) {
    return args.component.taskId
  }

  return resolveWorkflowTemplateTaskId(args.component.workflowKind, args.workflowTaskCatalog)
}

/**
 * @example
 * ```ts
 * const label = resolveProjectWorkflowTaskTitle("task-1", [
 *   { taskId: "task-1", taskTitle: "Task 1" },
 * ])
 * ```
 */
function resolveProjectWorkflowTaskTitle(
  taskId: string | null,
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[],
) {
  if (!taskId) {
    return "ещё не назначен"
  }

  const task = workflowTaskCatalog.find((entry) => entry.taskId === taskId)
  return task ? `${task.taskTitle} (${task.taskId})` : taskId
}

export {
  resolveProjectComponentTaskId,
  resolveProjectWorkflowTaskTitle,
}

export type { ProjectWorkflowTaskCatalogItem }
