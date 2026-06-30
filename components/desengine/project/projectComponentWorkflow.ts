import type { ProjectComponent } from "@/lib/project/component-runtime"

type ProjectWorkflowTaskCatalogItem = {
  taskId: string
  taskTitle: string
}

/**
 * @example
 * ```ts
 * const taskId = resolveProjectComponentTaskId({
 *   component,
 *   components,
 *   occupiedTaskIds: [],
 *   workflowTaskCatalog: [{ taskId: "task-1", taskTitle: "Task 1" }],
 * })
 * ```
 */
function resolveProjectComponentTaskId(args: {
  component: ProjectComponent
  components: ProjectComponent[]
  occupiedTaskIds: string[]
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
}) {
  if (args.component.taskId) {
    return args.component.taskId
  }

  return args.workflowTaskCatalog[0]?.taskId ?? null
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
