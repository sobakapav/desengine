import type { ProjectComponent } from "@/lib/project/component-runtime"

type ProjectWorkflowTaskCatalogItem = {
  taskId: string
  taskTitle: string
}

function normalizeWorkflowTaskKey(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9а-яё]/g, "")
}

function resolveMatchingTaskId(
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[],
  candidateValues: Array<string | null | undefined>,
) {
  for (const candidateValue of candidateValues) {
    if (!candidateValue?.trim()) {
      continue
    }

    const exactTask = workflowTaskCatalog.find((task) => task.taskId === candidateValue)
    if (exactTask) {
      return exactTask.taskId
    }

    const normalizedCandidateValue = normalizeWorkflowTaskKey(candidateValue)
    const normalizedTask = workflowTaskCatalog.find(
      (task) => normalizeWorkflowTaskKey(task.taskId) === normalizedCandidateValue,
    )

    if (normalizedTask) {
      return normalizedTask.taskId
    }
  }

  return null
}

/**
 * @example
 * ```ts
 * const taskId = resolveProjectComponentTaskId({
 *   component,
 *   components,
 *   occupiedTaskIds: [],
 *   projectTitle: "oncor-row",
 *   workflowTaskCatalog: [{ taskId: "task-1", taskTitle: "Task 1" }],
 * })
 * ```
 */
function resolveProjectComponentTaskId(args: {
  component: ProjectComponent
  components: ProjectComponent[]
  occupiedTaskIds: string[]
  projectTitle?: string | null
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
}) {
  if (args.component.taskId) {
    return args.component.taskId
  }

  const matchedTaskId = resolveMatchingTaskId(args.workflowTaskCatalog, [
    args.component.projectId,
    args.projectTitle,
  ])
  if (matchedTaskId) {
    return matchedTaskId
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
