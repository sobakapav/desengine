import "server-only"

import { runTaskMutation } from "@/lib/task/mutation-boundary"

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

async function runStartTaskLevelMutation(taskId: string, startedAt: number): Promise<TaskActionHttpResult> {
  console.log("[desengine][task-start] start", { taskId })

  const loaded = await loadStartRuntimeContext(taskId)
  if ("response" in loaded) return loaded.response

  const { context } = loaded
  if (context.already && context.taskItem.progress.currentLevelStarted) {
    return resumeStartedLevel(taskId, context.taskItem)
  }

  const llmInput = await buildStartLlmInput(context)
  const llmStage = await runStartLlmStage(taskId, startedAt, context, llmInput.fileList, llmInput.instruction)
  if ("response" in llmStage) return llmStage.response

  const parseStage = parseStartStage(
    taskId,
    startedAt,
    llmStage.outputText,
    llmInput.fileList,
    llmInput.taskData.contentByFileId,
  )
  if ("response" in parseStage) return parseStage.response

  const writeStage = await writeStartStage(
    taskId,
    startedAt,
    parseStage.payload,
    context.labContext.editableFileIds,
  )
  if ("response" in writeStage) return writeStage.response

  return completeStartTaskLevel(taskId, startedAt, context, writeStage.writeResult)
}

export const taskStartAction = {
  async startTaskLevel(taskId: string): Promise<TaskActionHttpResult> {
    return runTaskMutation(taskId, () => runStartTaskLevelMutation(taskId, Date.now()))
  },
}
