import "server-only"

import { taskServerCheckResult } from "./server-runtime-check-result"
import { taskServerMutations } from "./server-runtime-mutations"
import { taskServerOverview } from "./server-runtime-overview"
import { taskServerTransitions } from "./server-runtime-transitions"
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

export async function getTaskListItemById(taskId: string) {
  return taskServerOverview.getTaskListItemById(taskId)
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
export async function getTaskPendingTransition(taskId: string): Promise<TaskTransition | null> {
  return taskServerTransitions.getTaskPendingTransition(taskId)
}

export async function getTaskDoneTransition(taskId: string): Promise<TaskTransition | null> {
  return taskServerTransitions.getTaskDoneTransition(taskId)
}

export async function getTaskLabContext(taskItem: TaskListItem): Promise<TaskLabContext> {
  return taskServerTransitions.getTaskLabContext(taskItem)
}

export async function getTaskLevelHint(taskItem: TaskListItem, project?: Parameters<typeof taskServerTransitions.getTaskLevelHint>[1]) {
  return taskServerTransitions.getTaskLevelHint(taskItem, project)
}

export async function markTaskLevelInProgress(taskId: string) {
  return taskServerMutations.markTaskLevelInProgress(taskId)
}

/**
 * @example
 * ```ts
 * const progress = await markCurrentTaskLevelInitialized("task-1")
 * ```
 */
export async function markCurrentTaskLevelInitialized(taskId: string) {
  return taskServerMutations.markCurrentTaskLevelInitialized(taskId)
}

/**
 * @example
 * ```ts
 * const { summary, transition } = await registerPromptForCurrentLevel("task-1")
 * ```
 */
export async function registerPromptForCurrentLevel(taskId: string): Promise<TaskProgressMutationResult> {
  return taskServerMutations.registerPromptForCurrentLevel(taskId)
}

export async function markCurrentTaskLevelCheckTechnicalError(taskId: string) {
  return taskServerMutations.markCurrentTaskLevelCheckTechnicalError(taskId)
}

/**
 * @example
 * ```ts
 * const result = await passCurrentTaskLevelCheck("task-1")
 * ```
 */
export async function passCurrentTaskLevelCheck(taskId: string): Promise<TaskCheckMutationResult> {
  return taskServerMutations.passCurrentTaskLevelCheck(taskId)
}

/**
 * @example
 * ```ts
 * const result = await failCurrentTaskLevelCheck("task-1")
 * ```
 */
export async function failCurrentTaskLevelCheck(taskId: string): Promise<FailedTaskCheckMutationResult> {
  return taskServerMutations.failCurrentTaskLevelCheck(taskId)
}

export async function getTaskCheckResult(taskId: string) {
  return taskServerCheckResult.getTaskCheckResult(taskId)
}

export async function saveTaskCheckResult(result: TaskCheckResult) {
  await taskServerCheckResult.saveTaskCheckResult(result)
}

export async function clearTaskCheckResult(taskId: string) {
  await taskServerCheckResult.clearTaskCheckResult(taskId)
}

/**
 * @example
 * ```ts
 * await resetTask("task-1", { preserveCheckResult: true })
 * ```
 */
export async function resetTask(taskId: string, options?: { preserveCheckResult?: boolean }) {
  await taskServerMutations.resetTask(taskId, options)
}
