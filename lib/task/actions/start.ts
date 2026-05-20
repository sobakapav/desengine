import "server-only"

import { writeFile } from "node:fs/promises"

import {
  cleanupForbiddenWorkbenchFiles,
  filterWorkbenchPayloadByAllowlist,
  getLevelEditableWorkbenchFiles,
} from "@/lib/lab/workbench"
import { toLlmErrorResponse } from "@/lib/llm/server"
import { isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import { readLevelIteratePrompt, readLevelStartPrompt, readPrompt } from "@/lib/prompt/server"
import { runTaskMutation } from "@/lib/task/mutation-boundary"
import { buildTaskRuntimePromptContext } from "@/lib/task/prompt-context"
import {
  clearTaskCheckResult,
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
  markCurrentTaskLevelInitialized,
  markTaskLevelInProgress,
} from "@/lib/task/server"
import {
  ensureUserTaskDir,
  getUserTaskFilePath,
} from "@/lib/user/server"

import { taskActionShared } from "./shared"
import { taskStartLlm } from "./start-llm"
import type { FilesPayload, OutputFile, TaskActionHttpResult } from "./types"

type StartWriteResult = {
  writtenFiles: string[]
  cleanup: {
    deletedFileIds: string[]
    deletedFilePaths: string[]
  }
}

type StartRuntimeContext = {
  taskItem: NonNullable<Awaited<ReturnType<typeof getTaskListItemById>>>
  level: Awaited<ReturnType<typeof getLevelForTaskItem>>
  labContext: Awaited<ReturnType<typeof getTaskLabContext>>
  already: boolean
  promptImages: Awaited<ReturnType<typeof getTaskLabContext>>["images"]
  imageBase64List: string[]
}

type StartLlmStageResult =
  | { outputText: string }
  | { response: TaskActionHttpResult }

type StartParseStageResult =
  | { payload: FilesPayload }
  | { response: TaskActionHttpResult }

type StartWriteStageResult =
  | { writeResult: StartWriteResult }
  | { response: TaskActionHttpResult }

async function resumeStartedLevel(
  taskId: string,
  taskItem: StartRuntimeContext["taskItem"],
): Promise<TaskActionHttpResult> {
  await clearTaskCheckResult(taskId)
  const labContext = await getTaskLabContext(taskItem)
  const cleanup = await cleanupForbiddenWorkbenchFiles(taskId, labContext.editableFileIds)

  if (cleanup.deletedFileIds.length > 0) {
    console.log("[desengine][task-start] forbidden_files_deleted", {
      taskId,
      deletedFileIds: cleanup.deletedFileIds,
      deletedFilePaths: cleanup.deletedFilePaths,
    })
  }

  const level = await getLevelForTaskItem(taskItem)
  const progress = await markTaskLevelInProgress(taskId)
  const taskData = await readTaskData(taskItem, labContext)
  return taskActionShared.jsonResult({ ok: true, taskData, taskItem: { ...taskItem, progress }, level })
}

async function writeStartFiles(
  taskId: string,
  payload: FilesPayload,
  editableFileIds: string[],
): Promise<StartWriteResult> {
  const filteredPayload = filterWorkbenchPayloadByAllowlist(payload, editableFileIds)
  const writtenFiles: string[] = []

  await ensureUserTaskDir(taskId)

  for (const entry of filteredPayload.allowedEntries) {
    const filePath = getUserTaskFilePath(taskId, entry.fileName)
    await writeFile(filePath, String(entry.content ?? ""), "utf-8")
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

async function loadStartRuntimeContext(taskId: string): Promise<
  | { context: StartRuntimeContext }
  | { response: TaskActionHttpResult }
> {
  const taskItem = await getTaskListItemById(taskId)
  if (!taskItem) {
    console.error("[desengine][task-start] task_not_found", { taskId })
    return { response: taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404) }
  }

  const level = await getLevelForTaskItem(taskItem)
  const labContext = await getTaskLabContext(taskItem)
  const already = await isTaskStarted(taskId)
  const promptImages = labContext.images.filter((image) => image.show)
  if (promptImages.length === 0) {
    console.error("[desengine][task-start] missing_prompt_images", { taskId })
    return { response: taskActionShared.jsonResult({ ok: false, error: "Для уровня не настроены картинки для LLM-контекста" }, 400) }
  }

  try {
    const imageBase64List = await taskActionShared.readPromptImages(taskId, promptImages)
    return { context: { taskItem, level, labContext, already, promptImages, imageBase64List } }
  } catch {
    console.error("[desengine][task-start] missing_required_images", {
      taskId,
      imageIds: promptImages.map((image) => image.id),
    })
    return { response: taskActionShared.jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404) }
  }
}

async function buildStartLlmInput(context: StartRuntimeContext) {
  const [startProd, did, levelSpecifyPrompt, levelInitPrompt, taskData] = await Promise.all([
    readPrompt("production", "start-component"),
    readPrompt("didactic", "default"),
    readLevelIteratePrompt(context.level.id),
    readLevelStartPrompt(context.level.id),
    readTaskData(context.taskItem, context.labContext),
  ])

  const outputFiles = getLevelEditableWorkbenchFiles(context.labContext.editableFileIds)
  const fileList = outputFiles.map((file) => ({ id: file.id, fileName: file.fileName }))
  const promptContext = buildTaskRuntimePromptContext({
    taskId: context.taskItem.id,
    taskMaxLevel: context.taskItem.maxLevel,
    taskImages: context.labContext.images,
    level: context.level,
    taskData,
    taskItem: context.taskItem,
    workbenchFiles: outputFiles.map((file) => ({
      ...file,
      title: file.fileName,
      edit: true,
    })),
    constraints: ["structured-json-files", "allowed-workbench-files-only"],
    providerCapabilities: ["vision", "structured-output"],
  })
  const fileContext = taskStartLlm.buildFileContext(fileList, taskData.contentByFileId)
  const imagesText = context.promptImages
    .map((image) => `- ${image.id}.png — ${image.width}x${image.height}`)
    .join("\n")

  return {
    taskData,
    fileList,
    instruction: taskStartLlm.buildInstruction({
      already: context.already,
      productionPrompt: startProd,
      defaultDidacticPrompt: did,
      levelIteratePrompt: levelSpecifyPrompt,
      levelStartPrompt: levelInitPrompt,
      levelNumber: promptContext.renderContext.level?.number ?? context.level.number,
      imagesText,
      ...fileContext,
    }),
  }
}

async function runStartLlmStage(
  taskId: string,
  startedAt: number,
  context: StartRuntimeContext,
  fileList: OutputFile[],
  instruction: string,
): Promise<StartLlmStageResult> {
  try {
    const result = await taskStartLlm.call({
      instruction,
      imageBase64List: context.imageBase64List,
      outputFiles: fileList,
    })
    console.log("[desengine][task-start] llm_response_received", {
      taskId,
      provider: result.provider,
      model: result.model,
      outputTextLength: result.outputText.length,
      durationMs: Date.now() - startedAt,
    })
    return { outputText: result.outputText }
  } catch (error) {
    const response = toLlmErrorResponse(error)
    console.error("[desengine][task-start] llm_request_failed", {
      taskId,
      durationMs: Date.now() - startedAt,
      status: response.status,
      body: response.body,
    })
    return { response: taskActionShared.jsonResult(response.body, response.status) }
  }
}

function parseStartStage(
  taskId: string,
  startedAt: number,
  outputText: string,
  fileList: OutputFile[],
  contentByFileId: Record<string, string>,
): StartParseStageResult {
  try {
    return { payload: taskStartLlm.parsePayload(outputText, fileList, contentByFileId) }
  } catch (error) {
    console.error("[desengine][task-start] parse_failed", {
      taskId,
      durationMs: Date.now() - startedAt,
      message: error instanceof Error ? error.message : String(error),
      outputTextPreview: outputText.slice(0, 800),
      outputTextLength: outputText.length,
    })
    return {
      response: taskActionShared.jsonResult({
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось разобрать ответ",
        debug: {
          outputTextPreview: outputText.slice(0, 800),
          outputTextLength: outputText.length,
        },
      }, 500),
    }
  }
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
