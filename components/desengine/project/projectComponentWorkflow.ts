import type { ProjectComponent } from "@/lib/project/component-runtime"

type ProjectWorkflowTaskCatalogItem = {
  taskId: string
  taskTitle: string
}

const workflowTemplateTaskIdsByKind = {
  "image-to-component-workflow": [
    "easy-buy-app-badge",
  ],
} as const

function resolveWorkflowTemplateTaskId(
  workflowKind: ProjectComponent["workflowKind"],
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[],
) {
  const preferredTaskIds = workflowTemplateTaskIdsByKind[workflowKind] ?? []

  for (const preferredTaskId of preferredTaskIds) {
    const matchedTask = workflowTaskCatalog.find((task) => task.taskId === preferredTaskId)

    if (matchedTask) {
      return matchedTask.taskId
    }
  }

  return null
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
