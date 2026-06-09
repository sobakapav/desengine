import "server-only"

import { writeFile } from "node:fs/promises"

import {
  cleanupForbiddenWorkbenchFiles,
  filterWorkbenchPayloadByAllowlist,
} from "@/lib/lab/workbench"
import { readTaskData } from "@/lib/onboarding/repository"
import {
  clearTaskCheckResult,
  getTaskLabContext,
  getTaskListItemById,
  markCurrentTaskLevelInitialized,
} from "@/lib/task/server"
import {
  ensureUserTaskDir,
  getUserTaskFilePath,
} from "@/lib/user/server"
import { toLlmErrorResponse } from "@/lib/llm/server"

import {
  getTaskActionBudgetErrorDetails,
  validateTaskActionWriteSetBudget,
  type RuntimeBudgetExceededDetails,
} from "./runtime-llm-budget"
import { taskActionShared } from "./shared"
import type { StartRuntimeContext } from "./start-context"
import type { FilesPayload, TaskActionHttpResult } from "./types"

type StartWriteResult = {
  writtenFiles: string[]
  cleanup: {
    deletedFileIds: string[]
    deletedFilePaths: string[]
  }
}

type StartWriteStageResult =
  | { writeResult: StartWriteResult }
  | { response: TaskActionHttpResult; budgetErrorDetails?: RuntimeBudgetExceededDetails | null }

async function writeStartFiles(
  taskId: string,
  payload: FilesPayload,
  editableFileIds: string[],
): Promise<StartWriteResult> {
  const filteredPayload = filterWorkbenchPayloadByAllowlist(payload, editableFileIds)
  const writtenFiles: string[] = []
  const pendingWrites = filteredPayload.allowedEntries.map((entry) => ({
    fileId: entry.fileId,
    fileName: entry.fileName,
    content: String(entry.content ?? ""),
  }))

  validateTaskActionWriteSetBudget({
    path: "start",
    entries: pendingWrites,
  })

  await ensureUserTaskDir(taskId)

  for (const entry of pendingWrites) {
    const filePath = getUserTaskFilePath(taskId, entry.fileName)
    await writeFile(filePath, entry.content, "utf-8")
    writtenFiles.push(filePath)
  }

  if (filteredPayload.ignoredFileIds.length > 0) {
    console.log("[desengine][task-start] forbidden_payload_ignored", {
      taskId,
      ignoredFileIds: filteredPayload.ignoredFileIds,
    })
  }

  const cleanup = await cleanupForbiddenWorkbenchFiles(taskId, editableFileIds)
  return { writtenFiles, cleanup }
}

async function writeStartStage(
  taskId: string,
  startedAt: number,
  payload: FilesPayload,
  editableFileIds: string[],
): Promise<StartWriteStageResult> {
  try {
    return { writeResult: await writeStartFiles(taskId, payload, editableFileIds) }
  } catch (error) {
    const budgetErrorDetails = getTaskActionBudgetErrorDetails(error)
    if (budgetErrorDetails) {
      const response = toLlmErrorResponse(error)
      return { response: taskActionShared.jsonResult(response.body, response.status), budgetErrorDetails }
    }

    console.error("[desengine][task-start] write_error", {
      taskId,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : String(error),
      outcome: "write_error",
    })
    return {
      response: taskActionShared.jsonResult({
        ok: false,
        error: "Не удалось сохранить результат initiator-запуска. Повторите попытку.",
        errorKind: "write_error",
      }, 500),
    }
  }
}

async function completeStartTaskLevel(
  taskId: string,
  startedAt: number,
  context: StartRuntimeContext,
  writeResult: StartWriteResult,
): Promise<TaskActionHttpResult> {
  await clearTaskCheckResult(taskId)
  const progress = await markCurrentTaskLevelInitialized(taskId)
  const nextTaskItem = await getTaskListItemById(taskId)
  const nextLabContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null
  const nextTaskData = await readTaskData({ id: taskId }, nextLabContext)
  console.log("[desengine][task-start] success", {
    taskId,
    writtenFileCount: writeResult.writtenFiles.length,
    deletedFileIds: writeResult.cleanup.deletedFileIds,
    durationMs: Date.now() - startedAt,
  })

  return taskActionShared.jsonResult({
    ok: true,
    taskData: nextTaskData,
    taskItem: nextTaskItem ? { ...nextTaskItem, progress } : { ...context.taskItem, progress },
    level: context.level,
  })
}

export {
  completeStartTaskLevel,
  writeStartStage,
  type StartWriteResult,
}
