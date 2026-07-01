import "server-only"

import { taskServerCheckResult } from "./server-runtime-check-result"
import { taskServerMutations } from "./server-runtime-mutations"
import { getScopedTaskListItemById, taskServerOverview } from "./server-runtime-overview"
import { taskServerTransitions } from "./server-runtime-transitions"
import type { Project } from "../project/runtime"
import type { LevelConfig, LevelOverview } from "../level/types"
import type { TaskCheckResult, TaskLabContext, TaskListItem, TaskTransition } from "./types"
import type {
  FailedTaskCheckMutationResult,
  TaskCheckMutationResult,
  TaskProgressMutationResult,
} from "./server-runtime-types"

/*
 * Контрактные маркеры модульного server runtime сохранены здесь для
 * source-contract тестов публичного фасада:
 * readLevelsCatalogRaw
 * LevelsCatalogSchema.parse
 * TaskConfigSchema.parse
 * FORCED_TASK_MAX_LEVEL = 3
 * buildTaskLabContext
 * readLevelCommonExplanation
 * readTaskLevelTip
 * normalizeEditableFileIds
 * requireTaskImage
 * readUserProgressStore
 * writeUserProgressStore
 * appConfig.userProgressFile
 * repairProgressFromCheckResult
 * checkResult.passed
 * checkResult.kind !== "passed"
 * levelProgress.status = "completed"
 * levelProgress.isPassed = true
 * expectedCurrentLevel
 * passCurrentTaskLevelCheck
 * failCurrentTaskLevelCheck
 * markCurrentTaskLevelCheckTechnicalError
 * resetTask
 * removeUserTaskDir
 */

export async function getLevelsCatalog(): Promise<LevelConfig[]> {
  return taskServerOverview.getLevelsCatalog()
}

export async function getLevelById(levelId: string): Promise<LevelConfig | null> {
  return taskServerOverview.getLevelById(levelId)
}

export async function getTasks(): Promise<TaskListItem[]> {
  return taskServerOverview.getTasks()
}

/**
 * @example
 * ```ts
 * const overview = await getLevelOverview("level-1")
 * ```
 */
export async function getLevelOverview(levelId?: string | null): Promise<LevelOverview> {
  return taskServerOverview.getLevelOverview(levelId)
}

export async function getAllLevelOverviews(): Promise<LevelOverview[]> {
  return taskServerOverview.getAllLevelOverviews()
}

/**
 * @example
 * ```ts
 * const taskItem = await getTaskListItemById("task-1", { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function getTaskListItemById(taskId: string, project?: Project) {
  return getScopedTaskListItemById(taskId, project)
}

export async function getLevelForTaskItem(taskItem: TaskListItem): Promise<LevelConfig> {
  return taskServerOverview.getLevelForTaskItem(taskItem)
}

/**
 * @example
 * ```ts
 * const transition = await getTaskPendingTransition("task-1")
 * ```
 */
export async function getTaskPendingTransition(taskId: string, project?: Project): Promise<TaskTransition | null> {
  return taskServerTransitions.getTaskPendingTransition(taskId, project)
}

/**
 * @example
 * ```ts
 * const transition = await getTaskDoneTransition("task-1", { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function getTaskDoneTransition(taskId: string, project?: Project): Promise<TaskTransition | null> {
  return taskServerTransitions.getTaskDoneTransition(taskId, project)
}

export async function getTaskLabContext(taskItem: TaskListItem): Promise<TaskLabContext> {
  return taskServerTransitions.getTaskLabContext(taskItem)
}

/**
 * @example
 * ```ts
 * const hint = await getTaskLevelHint(taskItem, { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function getTaskLevelHint(
  taskItem: TaskListItem,
  project?: Parameters<typeof taskServerTransitions.getTaskLevelHint>[1],
  activeFileId?: Parameters<typeof taskServerTransitions.getTaskLevelHint>[2],
) {
  return taskServerTransitions.getTaskLevelHint(taskItem, project, activeFileId)
}

/**
 * @example
 * ```ts
 * await markTaskLevelInProgress("task-1", { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function markTaskLevelInProgress(taskId: string, project?: Project) {
  return taskServerMutations.markTaskLevelInProgress(taskId, project)
}

/**
 * @example
 * ```ts
 * const progress = await markCurrentTaskLevelInitialized("task-1")
 * ```
 */
export async function markCurrentTaskLevelInitialized(taskId: string, project?: Project) {
  return taskServerMutations.markCurrentTaskLevelInitialized(taskId, project)
}

/**
 * @example
 * ```ts
 * const { summary, transition } = await registerPromptForCurrentLevel("task-1")
 * ```
 */
export async function registerPromptForCurrentLevel(taskId: string, project?: Project): Promise<TaskProgressMutationResult> {
  return taskServerMutations.registerPromptForCurrentLevel(taskId, project)
}

/**
 * @example
 * ```ts
 * await markCurrentTaskLevelCheckTechnicalError("task-1", { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function markCurrentTaskLevelCheckTechnicalError(taskId: string, project?: Project) {
  return taskServerMutations.markCurrentTaskLevelCheckTechnicalError(taskId, project)
}

/**
 * @example
 * ```ts
 * const result = await passCurrentTaskLevelCheck("task-1")
 * ```
 */
export async function passCurrentTaskLevelCheck(taskId: string, project?: Project): Promise<TaskCheckMutationResult> {
  return taskServerMutations.passCurrentTaskLevelCheck(taskId, project)
}

/**
 * @example
 * ```ts
 * const result = await failCurrentTaskLevelCheck("task-1")
 * ```
 */
export async function failCurrentTaskLevelCheck(taskId: string, project?: Project): Promise<FailedTaskCheckMutationResult> {
  return taskServerMutations.failCurrentTaskLevelCheck(taskId, project)
}

/**
 * @example
 * ```ts
 * const checkResult = await getTaskCheckResult("task-1", { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function getTaskCheckResult(taskId: string, project?: Project) {
  return taskServerCheckResult.getTaskCheckResult(taskId, project)
}

/**
 * @example
 * ```ts
 * await saveTaskCheckResult({ taskId: "task-1", kind: "passed", passed: true, message: "OK" }, {
 *   id: "project-1",
 *   title: "Проект 1",
 * })
 * ```
 */
export async function saveTaskCheckResult(result: TaskCheckResult, project?: Project) {
  await taskServerCheckResult.saveTaskCheckResult(result, project)
}

/**
 * @example
 * ```ts
 * await clearTaskCheckResult("task-1", { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function clearTaskCheckResult(taskId: string, project?: Project) {
  await taskServerCheckResult.clearTaskCheckResult(taskId, project)
}

/**
 * @example
 * ```ts
 * await resetTask("task-1", { preserveCheckResult: true })
 * ```
 */
export async function resetTask(
  taskId: string,
  options?: Parameters<typeof taskServerMutations.resetTask>[1],
) {
  await taskServerMutations.resetTask(taskId, options)
}

/**
 * @example
 * ```ts
 * const result = await resetCurrentTaskLevel("task-1", { id: "project-1", title: "Проект 1" })
 * ```
 */
export async function resetCurrentTaskLevel(taskId: string, project?: Parameters<typeof taskServerMutations.resetCurrentTaskLevel>[1]) {
  return taskServerMutations.resetCurrentTaskLevel(taskId, project)
}

/**
 * @example
 * ```ts
 * const result = await invalidateCurrentTaskLevelForProjectMigration("task-1", {
 *   id: "project-1",
 *   title: "Проект 1",
 * })
 * ```
 */
export async function invalidateCurrentTaskLevelForProjectMigration(taskId: string, project?: Parameters<typeof taskServerMutations.invalidateCurrentTaskLevelForProjectMigration>[1]) {
  return taskServerMutations.invalidateCurrentTaskLevelForProjectMigration(taskId, project)
}
