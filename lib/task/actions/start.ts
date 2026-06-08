import "server-only"

import { runTaskMutation } from "@/lib/task/mutation-boundary"
import { saveCurrentTaskLevelSnapshot } from "@/lib/task/level-reset-storage"
import {
  attachRuntimeDiagnostics,
  createRuntimeDiagnosticsRecord,
  emitRuntimeDiagnostics,
} from "@/lib/task/runtime-observability"

import {
  loadStartRuntimeContext,
  resumeStartedLevel,
} from "./start-context"
import {
  completeStartTaskLevel,
  writeStartStage,
} from "./start-files"
import {
  buildStartLlmInput,
  parseStartStage,
  runStartLlmStage,
} from "./start-stage"
import type { TaskActionHttpResult } from "./types"

function finalizeStartResult(
  result: TaskActionHttpResult,
  diagnostics: Omit<ReturnType<typeof createRuntimeDiagnosticsRecord>, "timestamp">,
) {
  const record = createRuntimeDiagnosticsRecord(diagnostics)
  emitRuntimeDiagnostics(record)
  return attachRuntimeDiagnostics(result, [record])
}

async function runStartTaskLevelMutation(taskId: string, startedAt: number): Promise<TaskActionHttpResult> {
  console.log("[desengine][task-start] start", { taskId })

  const loaded = await loadStartRuntimeContext(taskId)
  if ("response" in loaded) {
    return finalizeStartResult(loaded.response, {
      scope: "task",
      path: "start",
      stage: "task_start",
      status: "error",
      durationMs: Date.now() - startedAt,
      taskId,
      degradation: {
        reason: "load_context_failed",
      },
    })
  }

  const { context } = loaded
  if (context.already && context.taskItem.progress.currentLevelStarted) {
    const resumed = await resumeStartedLevel(taskId, context.taskItem)
    return finalizeStartResult(resumed, {
      scope: "task",
      path: "start",
      stage: "task_start",
      status: "degraded",
      durationMs: Date.now() - startedAt,
      taskId,
      load: {
        promptImageCount: context.imageBase64List.length,
        editableFileCount: context.labContext.editableFileIds.length,
      },
      degradation: {
        reason: "already_started_resume",
      },
    })
  }

  const llmInput = await buildStartLlmInput(context)
  await saveCurrentTaskLevelSnapshot(
    taskId,
    context.level.number,
    context.labContext.editableFileIds,
    llmInput.taskData.contentByFileId,
  )
  const llmStage = await runStartLlmStage(taskId, startedAt, context, llmInput.fileList, llmInput.instruction)
  if ("response" in llmStage) {
    return finalizeStartResult(llmStage.response, {
      scope: "task",
      path: "start",
      stage: "task_start",
      status: "error",
      durationMs: Date.now() - startedAt,
      taskId,
      size: {
        instructionChars: llmInput.instruction.length,
        promptImageBase64Chars: context.imageBase64List.reduce((total, image) => total + image.length, 0),
      },
      load: {
        promptImageCount: context.imageBase64List.length,
        editableFileCount: llmInput.fileList.length,
      },
      degradation: {
        reason: "llm_request_failed",
      },
    })
  }

  const parseStage = parseStartStage(
    taskId,
    startedAt,
    llmStage.outputText,
    llmInput.fileList,
    llmInput.taskData.contentByFileId,
  )
  if ("response" in parseStage) {
    return finalizeStartResult(parseStage.response, {
      scope: "task",
      path: "start",
      stage: "task_start",
      status: "error",
      durationMs: Date.now() - startedAt,
      taskId,
      size: {
        instructionChars: llmStage.inputSize.instructionChars,
        outputChars: llmStage.outputText.length,
      },
      load: {
        promptImageCount: llmStage.inputSize.promptImageCount,
        editableFileCount: llmStage.inputSize.editableFileCount,
      },
      degradation: {
        reason: "structured_output_parse_failed",
      },
    })
  }

  const writeStage = await writeStartStage(
    taskId,
    startedAt,
    parseStage.payload,
    context.labContext.editableFileIds,
  )
  if ("response" in writeStage) {
    return finalizeStartResult(writeStage.response, {
      scope: "task",
      path: "start",
      stage: "task_start",
      status: "error",
      durationMs: Date.now() - startedAt,
      taskId,
      size: {
        instructionChars: llmStage.inputSize.instructionChars,
        outputChars: llmStage.outputText.length,
      },
      load: {
        promptImageCount: llmStage.inputSize.promptImageCount,
        editableFileCount: llmStage.inputSize.editableFileCount,
      },
      degradation: {
        reason: "write_stage_failed",
      },
    })
  }

  const completed = await completeStartTaskLevel(taskId, startedAt, context, writeStage.writeResult)
  return finalizeStartResult(completed, {
    scope: "task",
    path: "start",
    stage: "task_start",
    status: writeStage.writeResult.cleanup.deletedFileIds.length > 0 ? "degraded" : "ok",
    durationMs: Date.now() - startedAt,
    taskId,
    size: {
      instructionChars: llmStage.inputSize.instructionChars,
      promptImageBase64Chars: llmStage.inputSize.promptImageBase64Chars,
      outputChars: llmStage.outputText.length,
      writtenFileCount: writeStage.writeResult.writtenFiles.length,
    },
    load: {
      promptImageCount: llmStage.inputSize.promptImageCount,
      editableFileCount: llmStage.inputSize.editableFileCount,
    },
    degradation: writeStage.writeResult.cleanup.deletedFileIds.length > 0
      ? {
          reason: "cleanup_enforced",
          details: {
            deletedFileIds: writeStage.writeResult.cleanup.deletedFileIds,
          },
        }
      : undefined,
  })
}

export const taskStartAction = {
  async startTaskLevel(taskId: string): Promise<TaskActionHttpResult> {
    return runTaskMutation(taskId, () => runStartTaskLevelMutation(taskId, Date.now()))
  },
}
