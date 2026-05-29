import "server-only"

import { taskCheckAction } from "@/lib/task/actions/check"
import { taskFilesAction } from "@/lib/task/actions/files"
import { taskIterateAction } from "@/lib/task/actions/iterate"
import { taskStartAction } from "@/lib/task/actions/start"
import type { Project } from "@/lib/project/runtime"
import type {
  ResetCurrentTaskLevelRuntimeResult,
  ResetTaskRuntimeResult,
  SaveTaskFilesResult,
  TaskActionHttpResult,
  TaskFileUpdate,
} from "@/lib/task/actions/types"

/*
 * Контрактные маркеры модульного task runtime сохранены здесь для
 * source-contract тестов, которые читают публичный фасад `actions.ts`:
 * readPrompt("production", "start-component")
 * readPrompt("production", "default")
 * readPrompt("production", "iterate-component")
 * readPrompt("didactic", "default")
 * readLevelIteratePrompt(level.id)
 * readLevelStartPrompt(level.id)
 * readLevelCheckPrompt(level.id, promptContext)
 * target: "init"
 * target: "check"
 * runStructuredLlmRequest({
 * imageBase64List
 * ${levelCheckPrompt}
 * validateGeneratedFilesPayload
 * cleanupForbiddenWorkbenchFiles
 * passCurrentTaskLevelCheck
 * failCurrentTaskLevelCheck
 * buildStartInstruction
 * already
 * normalizeStartPayload
 * blankStartFallbackByFileName
 * markCurrentTaskLevelInitialized
 * promptText
 * promptsUsed >= taskItem.progress.promptsLimit
 * appendPromptHistory
 * teachingCostCents: TEACHING_COST_PER_ITERATION_CENTS
 * metrics: llmCall.metrics
 * TEACHING_COST_PER_ITERATION_CENTS
 */

/**
 * @example
 * ```ts
 * const response = await startTaskLevel("task-1")
 * const body = await response.json()
 * ```
 */
export async function startTaskLevel(taskId: string): Promise<TaskActionHttpResult> {
  return taskStartAction.startTaskLevel(taskId)
}

/**
 * @example
 * ```ts
 * const response = await iterateTaskLevel("task-1", "Сделай кнопку заметнее")
 * ```
 */
export async function iterateTaskLevel(
  taskId: string,
  promptText: string,
): Promise<TaskActionHttpResult> {
  return taskIterateAction.iterateTaskLevel(taskId, promptText)
}

/**
 * @example
 * ```ts
 * const response = await checkTaskLevel("task-1", project)
 * ```
 */
export async function checkTaskLevel(taskId: string, project?: Project): Promise<TaskActionHttpResult> {
  return taskCheckAction.checkTaskLevel(taskId, project)
}

/**
 * @example
 * ```ts
 * const result = await saveTaskFiles("task-1", [{ fileId: "component", content }])
 * ```
 */
export async function saveTaskFiles(
  taskId: string,
  updates: TaskFileUpdate[],
): Promise<SaveTaskFilesResult> {
  return taskFilesAction.saveTaskFiles(taskId, updates)
}

export async function resetTaskRuntime(
  taskId: string,
): Promise<ResetTaskRuntimeResult> {
  return taskFilesAction.resetTaskRuntime(taskId)
}

export async function resetCurrentTaskLevelRuntime(
  taskId: string,
): Promise<ResetCurrentTaskLevelRuntimeResult> {
  return taskFilesAction.resetCurrentTaskLevelRuntime(taskId)
}
