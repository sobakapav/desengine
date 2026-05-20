import "server-only"

import { writeFile } from "node:fs/promises"

import {
  cleanupForbiddenWorkbenchFiles,
  filterWorkbenchPayloadByAllowlist,
  getLevelEditableWorkbenchFiles,
} from "@/lib/lab/workbench"
import { runStructuredLlmRequest, toLlmErrorResponse } from "@/lib/llm/server"
import { appendPromptHistory, isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import { formatPromptHistoryTimestamp, TEACHING_COST_PER_ITERATION_CENTS } from "@/lib/prompt/history"
import { readLevelIteratePrompt, readPrompt } from "@/lib/prompt/server"
import { runTaskMutation } from "@/lib/task/mutation-boundary"
import {
  clearTaskCheckResult,
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
  registerPromptForCurrentLevel,
} from "@/lib/task/server"
import {
  ensureUserTaskDir,
  getUserTaskFilePath,
} from "@/lib/user/server"

import { taskIterateLlm } from "./iterate-llm"
import { taskActionShared } from "./shared"
import type {
  NullableFilesPayload,
  OutputFile,
  TaskActionHttpResult,
} from "./types"

type IterationContext = {
  taskItem: NonNullable<Awaited<ReturnType<typeof getTaskListItemById>>>
  labContext: Awaited<ReturnType<typeof getTaskLabContext>>
  editableFiles: OutputFile[]
}

type IterationWriteResult = {
  changedFileIds: string[]
  changedFileNames: string[]
  ignoredFileIds: string[]
  deletedAfterIterationFileIds: string[]
}

type IterationContextLoadResult =
  | {
    context: IterationContext
    cleanupBeforeIteration: Awaited<ReturnType<typeof cleanupForbiddenWorkbenchFiles>>
    promptImages: IterationContext["labContext"]["images"]
  }
  | { error: TaskActionHttpResult }

type IterationLlmStageResult =
  | {
    llmCall: Awaited<ReturnType<typeof runStructuredLlmRequest>>
    outputText: string
  }
  | { response: TaskActionHttpResult }

type IterationParseStageResult =
  | { payload: NullableFilesPayload }
  | { response: TaskActionHttpResult }

async function validateIterationRequest(taskId: string, promptText: string) {
  if (!promptText) {
    return taskActionShared.jsonResult({ ok: false, error: "Введите уточняющий промпт" }, 400)
  }

  const started = await isTaskStarted(taskId)
  if (!started) {
    return taskActionShared.jsonResult({ ok: false, error: "Сначала запустите задачу" }, 400)
  }

  const taskItem = await getTaskListItemById(taskId)
  if (!taskItem) {
    return taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404)
  }

  if (taskItem.progress.currentLevelStatus === "completed") {
    return taskActionShared.jsonResult({ ok: false, error: "Текущий уровень уже завершён" }, 409)
  }

  if (!taskItem.progress.currentLevelStarted) {
    return taskActionShared.jsonResult({ ok: false, error: "Сначала начните текущий уровень" }, 409)
  }

  if (taskItem.progress.promptsUsed >= taskItem.progress.promptsLimit) {
    return taskActionShared.jsonResult({ ok: false, error: "Лимит промптов для уровня уже исчерпан" }, 409)
  }

  return { taskItem }
}

async function loadIterationContext(
  taskId: string,
  taskItem: IterationContext["taskItem"],
): Promise<IterationContextLoadResult> {
  const labContext = await getTaskLabContext(taskItem)
  const cleanupBeforeIteration = await cleanupForbiddenWorkbenchFiles(taskId, labContext.editableFileIds)
  const promptImages = labContext.images.filter((image) => image.show)

  if (promptImages.length === 0) {
    return { error: taskActionShared.jsonResult({ ok: false, error: "Для уровня не настроены картинки для LLM-контекста" }, 400) }
  }

  const editableFiles = getLevelEditableWorkbenchFiles(labContext.editableFileIds)
  if (editableFiles.length === 0) {
    return { error: taskActionShared.jsonResult({ ok: false, error: "Для уровня не настроены доступные рабочие файлы" }, 400) }
  }

  return {
    context: { taskItem, labContext, editableFiles },
    cleanupBeforeIteration,
    promptImages,
  }
}

async function writeIterationFiles(args: {
  taskId: string
  payload: NullableFilesPayload
  editableFileIds: string[]
  contentByFileId: Record<string, string>
}): Promise<IterationWriteResult> {
  const filteredPayload = filterWorkbenchPayloadByAllowlist(args.payload, args.editableFileIds)
  const changedFileIds: string[] = []
  const changedFileNames: string[] = []

  await ensureUserTaskDir(args.taskId)

  for (const entry of filteredPayload.allowedEntries) {
    if (typeof entry.content !== "string") continue
    if (entry.content === (args.contentByFileId[entry.fileId] ?? "")) continue

    const filePath = getUserTaskFilePath(args.taskId, entry.fileName)
    await writeFile(filePath, entry.content, "utf-8")
    changedFileIds.push(entry.fileId)
    changedFileNames.push(entry.fileName)
  }

  const cleanupAfterIteration = await cleanupForbiddenWorkbenchFiles(args.taskId, args.editableFileIds)
  return {
    changedFileIds,
    changedFileNames,
    ignoredFileIds: filteredPayload.ignoredFileIds,
    deletedAfterIterationFileIds: cleanupAfterIteration.deletedFileIds,
  }
}

async function buildIterationLlmInput(args: {
  taskId: string
  promptText: string
  context: IterationContext
  promptImages: Awaited<ReturnType<typeof getTaskLabContext>>["images"]
}) {
  const level = await getLevelForTaskItem(args.context.taskItem)
  const taskData = await readTaskData(args.context.taskItem, args.context.labContext)
  const prompts = await Promise.all([
    readPrompt("production", "default"),
    readPrompt("production", "iterate-component"),
    readPrompt("didactic", "default"),
    readLevelIteratePrompt(level.id),
  ])

  const selectedFiles = args.context.editableFiles.map((file) => ({
    ...file,
    content: taskData.contentByFileId[file.id] ?? "",
  }))
  const instruction = taskIterateLlm.buildInstruction({
    defaultProductionPrompt: prompts[0],
    iterateProductionPrompt: prompts[1],
    defaultDidacticPrompt: prompts[2],
    levelSpecifyPrompt: prompts[3],
    commonExplanation: args.context.labContext.commonExplanation,
    allowedFilesText: taskActionShared.formatAllowedFilesText(args.context.editableFiles),
    promptText: args.promptText,
    imagesText: args.promptImages.map((image) => `- ${image.id}.png — ${image.width}x${image.height}`).join("\n"),
    selectedFilesText: taskActionShared.formatFilesContextText(selectedFiles),
  })

  return { taskData, instruction }
}

async function runIterationLlmStage(
  instruction: string,
  imageBase64List: string[],
  editableFiles: OutputFile[],
): Promise<IterationLlmStageResult> {
  try {
    const llmCall = await taskIterateLlm.call({ instruction, imageBase64List, editableFiles })
    return { llmCall, outputText: llmCall.outputText }
  } catch (error) {
    const response = toLlmErrorResponse(error)
    return { response: taskActionShared.jsonResult(response.body, response.status) }
  }
}

function parseIterationStage(outputText: string, editableFiles: OutputFile[]): IterationParseStageResult {
  try {
    return { payload: taskIterateLlm.parsePayload(outputText, editableFiles) }
  } catch (error) {
    return {
      response: taskActionShared.jsonResult({
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось разобрать ответ",
      }, 500),
    }
  }
}

async function appendIterationEntry(args: {
  taskId: string
  promptText: string
  context: IterationContext
  taskData: Awaited<ReturnType<typeof readTaskData>>
  written: IterationWriteResult
  llmCall: Awaited<ReturnType<typeof runStructuredLlmRequest>>
}) {
  const createdAt = new Date().toISOString()
  await appendPromptHistory(args.taskId, {
    text: args.promptText,
    createdAt,
    displayCreatedAt: formatPromptHistoryTimestamp(createdAt),
    iterationNumber: args.taskData.promptHistory.length + 1,
    levelNumber: args.context.taskItem.progress.currentLevel,
    selectedFileNames: args.context.editableFiles.map((file) => file.fileName),
    changedFileIds: args.written.changedFileIds,
    changedFileNames: args.written.changedFileNames,
    teachingCostCents: TEACHING_COST_PER_ITERATION_CENTS,
    llmCall: {
      provider: args.llmCall.provider,
      model: args.llmCall.model,
      metrics: args.llmCall.metrics,
    },
  })
}

function logIterationAllowlist(args: {
  taskId: string
  written: IterationWriteResult
  cleanupBeforeIteration: Awaited<ReturnType<typeof cleanupForbiddenWorkbenchFiles>>
}) {
  if (
    args.written.ignoredFileIds.length === 0
    && args.cleanupBeforeIteration.deletedFileIds.length === 0
    && args.written.deletedAfterIterationFileIds.length === 0
  ) {
    return
  }

  console.log("[desengine][task-iterate] allowlist_enforced", {
    taskId: args.taskId,
    ignoredFileIds: args.written.ignoredFileIds,
    deletedBeforeIterationFileIds: args.cleanupBeforeIteration.deletedFileIds,
    deletedAfterIterationFileIds: args.written.deletedAfterIterationFileIds,
  })
}

async function completeIterationTaskLevel(taskId: string) {
  await clearTaskCheckResult(taskId)
  const progressUpdate = await registerPromptForCurrentLevel(taskId)
  const nextTaskItem = await getTaskListItemById(taskId)
  const nextLabContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null
  const nextTaskData = await readTaskData({ id: taskId }, nextLabContext)
  return taskActionShared.jsonResult({
    ok: true,
    taskData: nextTaskData,
    taskItem: nextTaskItem ? { ...nextTaskItem, progress: progressUpdate.summary } : null,
    transition: progressUpdate.transition,
  })
}

async function runIterateTaskLevelMutation(taskId: string, promptText: string): Promise<TaskActionHttpResult> {
  const request = await validateIterationRequest(taskId, promptText)
  if ("status" in request || !("taskItem" in request)) return request

  const loaded = await loadIterationContext(taskId, request.taskItem)
  if ("error" in loaded) return loaded.error

  const { context, cleanupBeforeIteration, promptImages } = loaded
  let imageBase64List: string[]
  try {
    imageBase64List = await taskActionShared.readPromptImages(taskId, promptImages)
  } catch {
    return taskActionShared.jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404)
  }

  const llmInput = await buildIterationLlmInput({ taskId, promptText, context, promptImages })
  const llmStage = await runIterationLlmStage(
    llmInput.instruction,
    imageBase64List,
    context.editableFiles,
  )
  if ("response" in llmStage) return llmStage.response

  const parseStage = parseIterationStage(llmStage.outputText, context.editableFiles)
  if ("response" in parseStage) return parseStage.response

  const written = await writeIterationFiles({
    taskId,
    payload: parseStage.payload,
    editableFileIds: context.labContext.editableFileIds,
    contentByFileId: llmInput.taskData.contentByFileId,
  })
  await appendIterationEntry({ taskId, promptText, context, taskData: llmInput.taskData, written, llmCall: llmStage.llmCall })
  logIterationAllowlist({ taskId, written, cleanupBeforeIteration })
  return completeIterationTaskLevel(taskId)
}

export const taskIterateAction = {
  async iterateTaskLevel(taskId: string, promptText: string): Promise<TaskActionHttpResult> {
    return runTaskMutation(taskId, () => runIterateTaskLevelMutation(taskId, promptText))
  },
}
