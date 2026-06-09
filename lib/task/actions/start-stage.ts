import "server-only"

import { getLevelEditableWorkbenchFiles } from "@/lib/lab/workbench"
import { toLlmErrorResponse } from "@/lib/llm/server"
import { readTaskData } from "@/lib/onboarding/repository"
import { readLevelIteratePrompt, readLevelStartPrompt, readPrompt } from "@/lib/prompt/server"
import { buildTaskRuntimePromptContext } from "@/lib/task/prompt-context"
import { sumTextLengths } from "@/lib/task/runtime-observability"

import { taskActionShared } from "./shared"
import type { StartRuntimeContext } from "./start-context"
import { taskStartLlm } from "./start-llm"
import type { FilesPayload, OutputFile, TaskActionHttpResult } from "./types"

type StartLlmInput = {
  taskData: Awaited<ReturnType<typeof readTaskData>>
  fileList: OutputFile[]
  instruction: string
}

type StartLlmStageResult =
  | {
    outputText: string
    llmCall: Awaited<ReturnType<typeof taskStartLlm.call>>
    inputSize: {
      instructionChars: number
      promptImageCount: number
      promptImageBase64Chars: number
      editableFileCount: number
    }
  }
  | { response: TaskActionHttpResult }

type StartParseStageResult =
  | { payload: FilesPayload }
  | { response: TaskActionHttpResult }

async function buildStartLlmInput(context: StartRuntimeContext): Promise<StartLlmInput> {
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
    return {
      outputText: result.outputText,
      llmCall: result,
      inputSize: {
        instructionChars: instruction.length,
        promptImageCount: context.imageBase64List.length,
        promptImageBase64Chars: sumTextLengths(context.imageBase64List),
        editableFileCount: fileList.length,
      },
    }
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

export {
  buildStartLlmInput,
  parseStartStage,
  runStartLlmStage,
}
