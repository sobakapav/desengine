import "server-only"

import {
  getLevelEditableWorkbenchFiles,
} from "@/lib/lab/workbench"
import { runStructuredLlmRequest } from "@/lib/llm/server"
import { isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import { readLevelCheckPrompt, readPrompt } from "@/lib/prompt/server"
import type { Project } from "@/lib/project/runtime"
import { runTaskMutation } from "@/lib/task/mutation-boundary"
import {
  clearTaskCheckResult,
  failCurrentTaskLevelCheck,
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
  markCurrentTaskLevelCheckTechnicalError,
  passCurrentTaskLevelCheck,
  saveTaskCheckResult,
} from "@/lib/task/server"
import type { TaskCheckResult } from "@/lib/task/types"

import { buildTaskPromptContext } from "../prompt-context"
import { taskActionShared } from "./shared"
import type { OutputFile, TaskActionHttpResult } from "./types"

type CheckContext = {
  taskItem: NonNullable<Awaited<ReturnType<typeof getTaskListItemById>>>
  level: Awaited<ReturnType<typeof getLevelForTaskItem>>
  labContext: Awaited<ReturnType<typeof getTaskLabContext>>
  editableFiles: OutputFile[]
}

type CheckResponse = {
  passed: boolean
  message: string
}

type CheckContextLoadResult =
  | {
    context: CheckContext
    promptImages: CheckContext["labContext"]["images"]
  }
  | { error: TaskActionHttpResult }

async function validateCheckRequest(taskId: string) {
  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    return taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404)
  }

  const started = await isTaskStarted(taskId)
  if (!started) {
    return taskActionShared.jsonResult({ ok: false, error: "Сначала запустите задачу" }, 409)
  }

  if (!taskItem.progress.currentLevelStarted) {
    return taskActionShared.jsonResult({ ok: false, error: "Сначала начните текущий уровень" }, 409)
  }

  if (taskItem.progress.currentLevelStatus === "completed") {
    return taskActionShared.jsonResult({ ok: false, error: "Текущий уровень уже завершён" }, 409)
  }

  return { taskItem }
}

async function loadCheckContext(taskItem: CheckContext["taskItem"]): Promise<CheckContextLoadResult> {
  const level = await getLevelForTaskItem(taskItem)
  const labContext = await getTaskLabContext(taskItem)
  const promptImages = labContext.images.filter((image) => image.show)

  if (promptImages.length === 0) {
    return { error: taskActionShared.jsonResult({ ok: false, error: "Для уровня не настроены картинки для проверки" }, 400) }
  }

  const editableFiles = getLevelEditableWorkbenchFiles(labContext.editableFileIds)
  if (editableFiles.length === 0) {
    return { error: taskActionShared.jsonResult({ ok: false, error: "Для уровня не настроены доступные рабочие файлы" }, 400) }
  }

  return {
    context: { taskItem, level, labContext, editableFiles },
    promptImages,
  }
}

function buildCheckInstruction(args: {
  defaultProductionPrompt: string
  defaultDidacticPrompt: string
  levelCheckPrompt: string
  commonExplanation: string
  allowedFilesText: string
  imagesText: string
  selectedFilesText: string
}) {
  return `
${args.defaultProductionPrompt}

${args.defaultDidacticPrompt}

${args.levelCheckPrompt}

ОБЩЕЕ ПОЯСНЕНИЕ УРОВНЯ:
${args.commonExplanation}

ПРОВЕРЬ РЕЗУЛЬТАТ ТЕКУЩЕГО УРОВНЯ.
Используй только содержательный итог.

Верни JSON со строгой схемой:
- \`passed\`: boolean
- \`message\`: string

\`message\` должно быть кратким, понятным пользователю и на русском языке.

РАЗРЕШЁННЫЕ РАБОЧИЕ ФАЙЛЫ:
${args.allowedFilesText}

КАРТИНКИ ТЕКУЩЕГО УРОВНЯ:
${args.imagesText}

ТЕКУЩЕЕ СОСТОЯНИЕ РАБОЧИХ ФАЙЛОВ:
${args.selectedFilesText}
`.trim()
}

async function callCheckLlm(instruction: string, imageBase64List: string[]) {
  const llmCall = await runStructuredLlmRequest({
    target: "check",
    instruction,
    imageBase64List,
    schemaName: "desengine_check_level_result",
    schema: {
      type: "object",
      additionalProperties: false,
      required: ["passed", "message"],
      properties: {
        passed: { type: "boolean" },
        message: { type: "string", minLength: 1 },
      },
    },
  })

  const parsed = JSON.parse(llmCall.outputText)
  if (
    !parsed
    || typeof parsed !== "object"
    || typeof parsed.passed !== "boolean"
    || typeof parsed.message !== "string"
    || !parsed.message.trim()
  ) {
    throw new Error("Проверка уровня вернула невалидный structured-ответ")
  }

  return {
    passed: parsed.passed,
    message: parsed.message.trim(),
  }
}

function buildCheckResult(
  context: CheckContext,
  update: { attemptNumber: number; maxCheckAttempts: number },
  response: CheckResponse,
  kind: TaskCheckResult["kind"],
): TaskCheckResult {
  return {
    taskId: context.taskItem.id,
    levelId: context.level.id,
    levelNumber: context.level.number,
    levelTitle: context.level.title,
    attemptNumber: update.attemptNumber,
    maxCheckAttempts: update.maxCheckAttempts,
    passed: response.passed,
    message: response.message,
    kind,
    createdAt: new Date().toISOString(),
  }
}

async function buildSuccessfulCheckResponse(taskId: string, context: CheckContext, response: CheckResponse) {
  await clearTaskCheckResult(taskId)
  const progressUpdate = await passCurrentTaskLevelCheck(taskId)
  const result = buildCheckResult(context, progressUpdate, response, "passed")

  await saveTaskCheckResult(result)

  const nextTaskItem = await getTaskListItemById(taskId)
  if (!nextTaskItem) {
    return taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404)
  }

  const taskResponse = await taskActionShared.buildTaskResponse(taskId, {
    ...nextTaskItem,
    progress: progressUpdate.summary,
  })

  return taskActionShared.jsonResult({
    ok: true,
    taskItem: { ...nextTaskItem, progress: progressUpdate.summary },
    taskData: taskResponse.taskData,
    started: taskResponse.started,
    checkResult: result,
    transition: progressUpdate.transition,
  })
}

async function buildFailedCheckResponse(taskId: string, context: CheckContext, response: CheckResponse) {
  const failureUpdate = await failCurrentTaskLevelCheck(taskId)
  const result = buildCheckResult(
    context,
    failureUpdate,
    response,
    failureUpdate.reset ? "failed_and_reset" : "failed",
  )

  await saveTaskCheckResult(result)

  const nextTaskItem = await getTaskListItemById(taskId)
  if (!nextTaskItem) {
    return taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404)
  }

  const taskResponse = await taskActionShared.buildTaskResponse(taskId, failureUpdate.summary
    ? { ...nextTaskItem, progress: failureUpdate.summary }
    : nextTaskItem)

  return taskActionShared.jsonResult({
    ok: true,
    taskItem: failureUpdate.summary
      ? { ...nextTaskItem, progress: failureUpdate.summary }
      : nextTaskItem,
    taskData: taskResponse.taskData,
    started: taskResponse.started,
    checkResult: result,
    transition: null,
  })
}

async function buildTechnicalCheckResponse(taskId: string, context: CheckContext, error: unknown) {
  const progress = await markCurrentTaskLevelCheckTechnicalError(taskId)
  const result: TaskCheckResult = {
    taskId,
    levelId: context.level.id,
    levelNumber: context.level.number,
    levelTitle: context.level.title,
    attemptNumber: context.taskItem.progress.checkAttemptsUsed + 1,
    maxCheckAttempts: context.level.maxCheckAttempts,
    passed: false,
    message: taskActionShared.buildTechnicalErrorMessage(error),
    kind: "technical_error",
    createdAt: new Date().toISOString(),
  }

  await saveTaskCheckResult(result)

  const nextTaskItem = await getTaskListItemById(taskId)
  if (!nextTaskItem) {
    return taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404)
  }

  const taskResponse = await taskActionShared.buildTaskResponse(taskId, {
    ...nextTaskItem,
    progress,
  })

  return taskActionShared.jsonResult({
    ok: true,
    taskItem: { ...nextTaskItem, progress },
    taskData: taskResponse.taskData,
    started: taskResponse.started,
    checkResult: result,
    transition: null,
  })
}

export const taskCheckAction = {
  async checkTaskLevel(taskId: string, project?: Project): Promise<TaskActionHttpResult> {
    return runTaskMutation(taskId, async (): Promise<TaskActionHttpResult> => {
      const request = await validateCheckRequest(taskId)
      if ("status" in request || !("taskItem" in request)) return request

      const loaded = await loadCheckContext(request.taskItem)
      if ("error" in loaded) return loaded.error

      const { context, promptImages } = loaded
      const taskData = await readTaskData(context.taskItem, context.labContext)
      const promptContext = buildTaskPromptContext({
        taskId,
        taskMaxLevel: context.taskItem.maxLevel,
        taskImages: context.labContext.images,
        level: context.level,
        project,
      })
      const [defaultProductionPrompt, defaultDidacticPrompt, levelCheckPrompt] = await Promise.all([
        readPrompt("production", "default"),
        readPrompt("didactic", "default"),
        readLevelCheckPrompt(context.level.id, promptContext),
      ])

      let imageBase64List: string[]
      try {
        imageBase64List = await taskActionShared.readPromptImages(taskId, promptImages)
      } catch {
        return taskActionShared.jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404)
      }

      const selectedFiles = context.editableFiles.map((file) => ({
        ...file,
        content: taskData.contentByFileId[file.id] ?? "",
      }))
      const instruction = buildCheckInstruction({
        defaultProductionPrompt,
        defaultDidacticPrompt,
        levelCheckPrompt,
        commonExplanation: context.labContext.commonExplanation,
        allowedFilesText: taskActionShared.formatAllowedFilesText(context.editableFiles),
        imagesText: promptImages.map((image) => `- ${image.id}.png — ${image.width}x${image.height}`).join("\n"),
        selectedFilesText: taskActionShared.formatFilesContextText(selectedFiles),
      })

      let checkResponse: CheckResponse
      try {
        checkResponse = await callCheckLlm(instruction, imageBase64List)
      } catch (error) {
        return buildTechnicalCheckResponse(taskId, context, error)
      }

      if (checkResponse.passed) {
        return buildSuccessfulCheckResponse(taskId, context, checkResponse)
      }

      return buildFailedCheckResponse(taskId, context, checkResponse)
    })
  },
}
