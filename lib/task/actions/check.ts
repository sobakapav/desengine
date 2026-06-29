import "server-only"

import {
  getLevelEditableWorkbenchFiles,
} from "@/lib/lab/workbench"
import { runStructuredLlmRequest, toLlmErrorResponse } from "@/lib/llm/server"
import { isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import { readLevelCheckPrompt, readPrompt } from "@/lib/prompt/server"
import type { Project } from "@/lib/project/runtime"
import {
  createTaskMutationOverloadHttpResult,
  isTaskMutationOverloadError,
  runTaskMutation,
} from "@/lib/task/mutation-boundary"
import {
  attachRuntimeDiagnostics,
  createRuntimeDiagnosticsRecord,
  emitRuntimeDiagnostics,
  sumTextLengths,
} from "@/lib/task/runtime-observability"
import {
  buildTaskMutationScopeKey,
  resolveTaskProject,
} from "@/lib/task/project-runtime-scope"
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

import { buildTaskRuntimePromptContext } from "../prompt-context"
import {
  getTaskActionBudgetErrorDetails,
  validateTaskActionInputBudget,
  validateTaskActionStructuredOutputBudget,
} from "./runtime-llm-budget"
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
  llmCall: Awaited<ReturnType<typeof runStructuredLlmRequest>>
}

type CheckContextLoadResult =
  | {
    context: CheckContext
    promptImages: CheckContext["labContext"]["images"]
  }
  | { error: TaskActionHttpResult }

async function validateCheckRequest(taskId: string, project: Project) {
  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    return taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404)
  }

  const started = await isTaskStarted(taskId, project)
  if (!started) {
    return taskActionShared.jsonResult({ ok: false, error: "Сначала запустите задачу" }, 409)
  }

  if (!taskItem.progress.currentLevelStarted) {
    return taskActionShared.jsonResult({ ok: false, error: "Сначала начните текущий уровень" }, 409)
  }

  if (taskItem.progress.currentLevelStatus === "completed") {
    return taskActionShared.jsonResult({ ok: false, error: "Текущий уровень уже завершён" }, 409)
  }

  if (taskItem.progress.checkAttemptsUsed >= taskItem.progress.checkAttemptsLimit) {
    return taskActionShared.jsonResult({
      ok: false,
      error: "Лимит содержательных проверок исчерпан. Сначала выполните явный сброс текущей итерации или всей задачи.",
    }, 409)
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
  taskCheckContract: string
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

TASK-SPECIFIC HIDDEN CHECK CONTRACT:
${args.taskCheckContract || "Не задан. Опирайся только на видимые элементы изображений и явный task tip."}

Если task-specific contract запрещает элемент, не считай его обязательным.
Если contract перечисляет приоритет причин провала, выбирай первую реально нарушенную причину и не подменяй её другой при том же состоянии кода.
Не придумывай обязательные элементы, которых нет в task contract, task tip или на изображениях текущего уровня.

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

  validateTaskActionStructuredOutputBudget({
    path: "check",
    outputText: llmCall.outputText,
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
    llmCall,
  }
}

function finalizeCheckResult(
  result: TaskActionHttpResult,
  diagnostics: Omit<ReturnType<typeof createRuntimeDiagnosticsRecord>, "timestamp">,
) {
  const record = createRuntimeDiagnosticsRecord(diagnostics)
  emitRuntimeDiagnostics(record)
  return attachRuntimeDiagnostics(result, [record])
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

async function buildSuccessfulCheckResponse(
  taskId: string,
  context: CheckContext,
  response: CheckResponse,
  project: Project,
) {
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
  }, project)

  return taskActionShared.jsonResult({
    ok: true,
    taskItem: { ...nextTaskItem, progress: progressUpdate.summary },
    taskData: taskResponse.taskData,
    started: taskResponse.started,
    checkResult: result,
    transition: progressUpdate.transition,
  })
}

async function buildFailedCheckResponse(
  taskId: string,
  context: CheckContext,
  response: CheckResponse,
  project: Project,
) {
  const failureUpdate = await failCurrentTaskLevelCheck(taskId)
  const result = buildCheckResult(
    context,
    failureUpdate,
    response,
    failureUpdate.exhausted ? "failed_limit_exhausted" : "failed",
  )

  await saveTaskCheckResult(result)

  const nextTaskItem = await getTaskListItemById(taskId)
  if (!nextTaskItem) {
    return taskActionShared.jsonResult({ ok: false, error: "Задание не найдено" }, 404)
  }

  const currentTaskItem = { ...nextTaskItem, progress: failureUpdate.summary }
  const taskResponse = await taskActionShared.buildTaskResponse(taskId, currentTaskItem, project)

  return taskActionShared.jsonResult({
    ok: true,
    taskItem: currentTaskItem,
    taskData: taskResponse.taskData,
    started: taskResponse.started,
    checkResult: result,
    transition: null,
  })
}

async function buildTechnicalCheckResponse(
  taskId: string,
  context: CheckContext,
  error: unknown,
  project: Project,
) {
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
  }, project)

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
    const resolvedProject = await resolveTaskProject(taskId, project)

    try {
      return await runTaskMutation(
        buildTaskMutationScopeKey(taskId, resolvedProject.id),
        async (): Promise<TaskActionHttpResult> => {
        const startedAt = Date.now()
        const request = await validateCheckRequest(taskId, resolvedProject)
        if ("status" in request || !("taskItem" in request)) {
          return finalizeCheckResult(request as TaskActionHttpResult, {
            scope: "task",
            path: "check",
            stage: "task_check",
            status: "error",
            durationMs: Date.now() - startedAt,
            taskId,
            degradation: {
              reason: "request_rejected",
            },
          })
        }

        const loaded = await loadCheckContext(request.taskItem)
        if ("error" in loaded) {
          return finalizeCheckResult(loaded.error, {
            scope: "task",
            path: "check",
            stage: "task_check",
            status: "error",
            durationMs: Date.now() - startedAt,
            taskId,
            degradation: {
              reason: "load_context_failed",
            },
          })
        }

        const { context, promptImages } = loaded
        const taskData = await readTaskData(context.taskItem, context.labContext, resolvedProject)
        const promptContext = buildTaskRuntimePromptContext({
          taskId,
          taskMaxLevel: context.taskItem.maxLevel,
          taskImages: context.labContext.images,
          levelTaskTip: context.labContext.taskTip,
          levelTaskCheckContract: context.labContext.taskCheckContract,
          level: context.level,
          project: resolvedProject,
          taskData,
          taskItem: context.taskItem,
          workbenchFiles: context.editableFiles.map((file) => ({
            ...file,
            title: file.fileName,
            edit: true,
          })),
          constraints: ["structured-json-check-result", "allowed-workbench-files-only"],
          providerCapabilities: ["vision", "structured-output"],
        })
        const [defaultProductionPrompt, defaultDidacticPrompt, levelCheckPrompt] = await Promise.all([
          readPrompt("production", "default"),
          readPrompt("didactic", "default"),
          readLevelCheckPrompt(context.level.id, promptContext.renderContext),
        ])

        let imageBase64List: string[]
        try {
          imageBase64List = await taskActionShared.readPromptImages(taskId, promptImages)
        } catch {
          return finalizeCheckResult(
            taskActionShared.jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404),
            {
              scope: "task",
              path: "check",
              stage: "task_check",
              status: "error",
              durationMs: Date.now() - startedAt,
              taskId,
              load: {
                promptImageCount: promptImages.length,
              },
              degradation: {
                reason: "missing_required_images",
              },
            },
          )
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
          taskCheckContract: context.labContext.taskCheckContract,
          allowedFilesText: taskActionShared.formatAllowedFilesText(context.editableFiles),
          imagesText: promptImages.map((image) => `- ${image.id}.png — ${image.width}x${image.height}`).join("\n"),
          selectedFilesText: taskActionShared.formatFilesContextText(selectedFiles),
        })

        try {
          validateTaskActionInputBudget({
            path: "check",
            instruction,
            imageBase64List,
          })
        } catch (error) {
          const response = toLlmErrorResponse(error)
          return finalizeCheckResult(taskActionShared.jsonResult(response.body, response.status), {
            scope: "task",
            path: "check",
            stage: "task_check",
            status: "error",
            durationMs: Date.now() - startedAt,
            taskId,
            size: {
              instructionChars: instruction.length,
              promptImageBase64Chars: sumTextLengths(imageBase64List),
              selectedFileChars: sumTextLengths(selectedFiles.map((file) => file.content)),
            },
            load: {
              promptImageCount: imageBase64List.length,
              editableFileCount: context.editableFiles.length,
            },
            degradation: {
              reason: "runtime_budget_exceeded",
              details: getTaskActionBudgetErrorDetails(error) ?? undefined,
            },
          })
        }

        let checkResponse: CheckResponse
        try {
          checkResponse = await callCheckLlm(instruction, imageBase64List)
        } catch (error) {
          if (getTaskActionBudgetErrorDetails(error)) {
            const response = toLlmErrorResponse(error)
            return finalizeCheckResult(taskActionShared.jsonResult(response.body, response.status), {
              scope: "task",
              path: "check",
              stage: "task_check",
              status: "error",
              durationMs: Date.now() - startedAt,
              taskId,
              size: {
                instructionChars: instruction.length,
                promptImageBase64Chars: sumTextLengths(imageBase64List),
                selectedFileChars: sumTextLengths(selectedFiles.map((file) => file.content)),
              },
              load: {
                promptImageCount: imageBase64List.length,
                editableFileCount: context.editableFiles.length,
              },
              degradation: {
                reason: "runtime_budget_exceeded",
                details: getTaskActionBudgetErrorDetails(error) ?? undefined,
              },
            })
          }

          const technicalResult = await buildTechnicalCheckResponse(taskId, context, error, resolvedProject)
          return finalizeCheckResult(technicalResult, {
            scope: "task",
            path: "check",
            stage: "task_check",
            status: "error",
            durationMs: Date.now() - startedAt,
            taskId,
            size: {
              instructionChars: instruction.length,
              promptImageBase64Chars: sumTextLengths(imageBase64List),
              selectedFileChars: sumTextLengths(selectedFiles.map((file) => file.content)),
            },
            load: {
              promptImageCount: imageBase64List.length,
              editableFileCount: context.editableFiles.length,
            },
            degradation: {
              reason: "technical_check_error",
              details: {
                message: error instanceof Error ? error.message : String(error),
              },
            },
          })
        }

        if (checkResponse.passed) {
          const successResult = await buildSuccessfulCheckResponse(taskId, context, checkResponse, resolvedProject)
          return finalizeCheckResult(successResult, {
            scope: "task",
            path: "check",
            stage: "task_check",
            status: "ok",
            durationMs: Date.now() - startedAt,
            taskId,
            size: {
              instructionChars: instruction.length,
              promptImageBase64Chars: sumTextLengths(imageBase64List),
              selectedFileChars: sumTextLengths(selectedFiles.map((file) => file.content)),
              outputChars: checkResponse.llmCall.outputText.length,
            },
            load: {
              promptImageCount: imageBase64List.length,
              editableFileCount: context.editableFiles.length,
            },
          })
        }

        const failedResult = await buildFailedCheckResponse(taskId, context, checkResponse, resolvedProject)
        return finalizeCheckResult(failedResult, {
          scope: "task",
          path: "check",
          stage: "task_check",
          status: "degraded",
          durationMs: Date.now() - startedAt,
          taskId,
          size: {
            instructionChars: instruction.length,
            promptImageBase64Chars: sumTextLengths(imageBase64List),
            selectedFileChars: sumTextLengths(selectedFiles.map((file) => file.content)),
            outputChars: checkResponse.llmCall.outputText.length,
          },
          load: {
            promptImageCount: imageBase64List.length,
            editableFileCount: context.editableFiles.length,
          },
          degradation: {
            reason: "check_failed",
          },
        })
      })
    } catch (error) {
      if (!isTaskMutationOverloadError(error)) {
        throw error
      }

      return finalizeCheckResult(createTaskMutationOverloadHttpResult(error), {
        scope: "task",
        path: "check",
        stage: "task_check",
        status: "error",
        durationMs: 0,
        taskId,
        load: error.diagnostics.load,
        degradation: {
          reason: "mutation_boundary_overload",
        },
      })
    }
  },
}
