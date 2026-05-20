import "server-only"

import { readFile, writeFile } from "node:fs/promises"

import { validateGeneratedFilesPayload } from "@/lib/lab/workbench"
import {
  cleanupForbiddenWorkbenchFiles,
  filterWorkbenchPayloadByAllowlist,
  getLevelEditableWorkbenchFileMap,
  getLevelEditableWorkbenchFiles,
} from "@/lib/lab/workbench"
import { runStructuredLlmRequest, toLlmErrorResponse } from "@/lib/llm/server"
import { formatPromptHistoryTimestamp, TEACHING_COST_PER_ITERATION_CENTS } from "@/lib/prompt/history"
import { readLevelCheckPrompt, readLevelIteratePrompt, readLevelStartPrompt, readPrompt } from "@/lib/prompt/server"
import { appConfig } from "@/lib/system/config/server"
import { appendPromptHistory, isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import { createEmptyTaskData } from "@/lib/task/data"
import {
  clearTaskCheckResult,
  failCurrentTaskLevelCheck,
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
  markCurrentTaskLevelCheckTechnicalError,
  markCurrentTaskLevelInitialized,
  markTaskLevelInProgress,
  passCurrentTaskLevelCheck,
  registerPromptForCurrentLevel,
  resetTask,
  saveTaskCheckResult,
} from "@/lib/task/server"
import type { TaskCheckResult, TaskData, TaskListItem } from "@/lib/task/types"
import {
  ensureUserTaskDir,
  getTaskCatalogFilePath,
  getUserTaskFilePath,
} from "@/lib/user/server"

import { runTaskMutation } from "./mutation-boundary"

type TaskFileUpdate = {
  fileId: string
  content: string
}

type TaskActionHttpResult = {
  status?: number
  body: unknown
}

type FilesPayload = Record<string, string>
type NullableFilesPayload = Record<string, string | null>

type OutputFile = {
  id: string
  fileName: string
}

type SaveTaskFilesResult =
  | {
      kind: "saved"
      written: number
    }
  | {
      kind: "not_found"
      error: string
    }
  | {
      kind: "write_failed"
      written: number
      errors: Array<{ fileId: string; error: string }>
    }

type ResetTaskRuntimeResult =
  | {
      kind: "reset"
      taskItem: TaskListItem | null
      taskData: TaskData | null
      started: false
    }
  | {
      kind: "not_found"
      error: string
    }

const blankStartFallbackByFileName: Record<string, string> = {
  "styles.ts": "export {};",
  "mock.ts": "export const mock = {};",
  "props.ts": "export {};",
}

function jsonResult(body: unknown, status?: number): TaskActionHttpResult {
  return { body, status }
}

function extractJson(text: string): unknown {
  const trimmed = (text || "").trim()
  if (!trimmed) return null

  const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i)
  const candidate = fenced ? fenced[1] : trimmed

  return JSON.parse(candidate)
}

function normalizeStartPayload(
  payload: FilesPayload,
  outputFiles: { id: string; fileName: string }[],
  currentContentByFileId: Record<string, string>,
): FilesPayload {
  const normalizedEntries = outputFiles.map((file) => {
    const rawContent = payload[file.id]

    if (typeof rawContent !== "string") {
      return [file.id, rawContent] as const
    }

    if (rawContent.trim()) {
      return [file.id, rawContent] as const
    }

    const existingContent = currentContentByFileId[file.id]?.trim()
    if (existingContent) {
      return [file.id, currentContentByFileId[file.id]] as const
    }

    return [file.id, blankStartFallbackByFileName[file.fileName] ?? rawContent] as const
  })

  return Object.fromEntries(normalizedEntries)
}

function formatAllowedFilesText(files: OutputFile[]) {
  return files.map((file) => `- ${file.id} — ${file.fileName}`).join("\n")
}

function getRelevantCurrentFiles(files: OutputFile[], contentByFileId: Record<string, string>) {
  return files
    .map((file) => ({
      ...file,
      content: contentByFileId[file.id] ?? "",
    }))
    .filter((file) => file.content.trim().length > 0)
}

function formatFilesContextText(files: Array<OutputFile & { content: string }>) {
  return files
    .map((file) => `FILE ${file.id} (${file.fileName})\n\`\`\`tsx\n${file.content}\n\`\`\``)
    .join("\n\n")
}

function buildStartInstruction({
  already,
  productionPrompt,
  defaultDidacticPrompt,
  levelIteratePrompt,
  levelStartPrompt,
  levelNumber,
  imagesText,
  allowedFilesText,
  relevantCurrentFilesText,
}: {
  already: boolean
  productionPrompt: string
  defaultDidacticPrompt: string
  levelIteratePrompt: string
  levelStartPrompt: string
  levelNumber: number
  imagesText: string
  allowedFilesText: string
  relevantCurrentFilesText: string
}) {
  const sections = [
    productionPrompt,
    defaultDidacticPrompt,
    levelIteratePrompt,
    levelStartPrompt,
    already
      ? `
ЗАДАНИЕ:
Это initiator-запуск нового уровня для уже существующей задачи.
Посмотри на картинки текущего уровня и сохрани полезные рабочие наработки только там, где они помогают уровню ${levelNumber}.
Если какого-то файла ещё нет в текущем состоянии, это нормально: ты можешь создать его с нуля.
`
      : `
ЗАДАНИЕ:
По картинкам текущего уровня создай первую рабочую реализацию набора файлов компонента.
Если какого-то файла пока нет, просто создай его с нуля.
`,
    `
КАРТИНКИ ТЕКУЩЕГО УРОВНЯ:
${imagesText}
`,
    `
## Разрешённые файлы результата
${allowedFilesText}

Верни полный набор файлов строго по этим ключам:
${allowedFilesText}

Значение каждого ключа должно быть полным текстовым содержимым соответствующего файла.
Нельзя возвращать имя файла, fileId, короткую заглушку или пояснение вместо кода.
`,
    already && relevantCurrentFilesText
      ? `
ТЕКУЩИЙ ПОЛЕЗНЫЙ КОНТЕКСТ ИЗ УЖЕ СУЩЕСТВУЮЩИХ ФАЙЛОВ:
${relevantCurrentFilesText}
`
      : "",
  ]

  return sections
    .map((section) => section.trim())
    .filter(Boolean)
    .join("\n\n")
}

function buildTechnicalErrorMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return `Проверка уровня временно недоступна: ${error.message}`
  }

  return "Проверка уровня временно недоступна. Повторите попытку ещё раз."
}

async function buildTaskResponse(taskId: string, taskItem: TaskListItem) {
  const started = await isTaskStarted(taskId)
  const labContext = await getTaskLabContext(taskItem)

  return {
    started,
    taskData: started
      ? await readTaskData(taskItem, labContext)
      : createEmptyTaskData(taskId, labContext),
  }
}

export async function startTaskLevel(taskId: string): Promise<TaskActionHttpResult> {
  return runTaskMutation(taskId, async () => {
    const startedAt = Date.now()

    console.log("[desengine][task-start] start", { taskId })

    const taskItem = await getTaskListItemById(taskId)
    if (!taskItem) {
      console.error("[desengine][task-start] task_not_found", { taskId })
      return jsonResult({ ok: false, error: "Задание не найдено" }, 404)
    }

    const level = await getLevelForTaskItem(taskItem)
    const labContext = await getTaskLabContext(taskItem)
    const already = await isTaskStarted(taskId)
    const levelEditableFiles = getLevelEditableWorkbenchFiles(labContext.editableFileIds)

    if (already && taskItem.progress.currentLevelStarted) {
      await clearTaskCheckResult(taskId)
      const cleanup = await cleanupForbiddenWorkbenchFiles(taskId, labContext.editableFileIds)
      if (cleanup.deletedFileIds.length > 0) {
        console.log("[desengine][task-start] forbidden_files_deleted", {
          taskId,
          deletedFileIds: cleanup.deletedFileIds,
          deletedFilePaths: cleanup.deletedFilePaths,
        })
      }

      const progress = await markTaskLevelInProgress(taskId)
      const taskData = await readTaskData(taskItem, labContext)
      return jsonResult({ ok: true, taskData, taskItem: { ...taskItem, progress }, level })
    }

    const promptImages = labContext.images.filter((image) => image.show)
    if (promptImages.length === 0) {
      console.error("[desengine][task-start] missing_prompt_images", { taskId })
      return jsonResult({ ok: false, error: "Для уровня не настроены картинки для LLM-контекста" }, 400)
    }

    let imageBase64List: string[]
    try {
      imageBase64List = await Promise.all(
        promptImages.map(async (image) => {
          const imagePath = getTaskCatalogFilePath(taskId, `${image.id}.png`)
          const buf = await readFile(imagePath)
          return buf.toString("base64")
        }),
      )
    } catch {
      console.error("[desengine][task-start] missing_required_images", {
        taskId,
        imageIds: promptImages.map((image) => image.id),
      })
      return jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404)
    }

    const [startProd, did, levelSpecifyPrompt, levelInitPrompt, taskData] = await Promise.all([
      readPrompt("production", "start-component"),
      readPrompt("didactic", "default"),
      readLevelIteratePrompt(level.id),
      readLevelStartPrompt(level.id),
      readTaskData(taskItem, labContext),
    ])

    const outputFiles = levelEditableFiles
    const fileList = outputFiles.map((file) => ({ id: file.id, fileName: file.fileName }))
    const allowedFilesText = formatAllowedFilesText(fileList)
    const relevantCurrentFiles = getRelevantCurrentFiles(outputFiles, taskData.contentByFileId)
    const relevantCurrentFilesText = formatFilesContextText(relevantCurrentFiles)
    const imagesText = promptImages.map((image) => `- ${image.id}.png — ${image.width}x${image.height}`).join("\n")

    const instruction = buildStartInstruction({
      already,
      productionPrompt: startProd,
      defaultDidacticPrompt: did,
      levelIteratePrompt: levelSpecifyPrompt,
      levelStartPrompt: levelInitPrompt,
      levelNumber: level.number,
      imagesText,
      allowedFilesText,
      relevantCurrentFilesText,
    })

    let outputText = ""
    try {
      const result = await runStructuredLlmRequest({
        target: "init",
        instruction,
        imageBase64List,
        schemaName: "desengine_start_component_files",
        schema: {
          type: "object",
          additionalProperties: false,
          required: outputFiles.map((file) => file.id),
          properties: Object.fromEntries(
            outputFiles.map((file) => [file.id, { type: "string" }]),
          ),
        },
      })
      outputText = result.outputText
      console.log("[desengine][task-start] llm_response_received", {
        taskId,
        provider: result.provider,
        model: result.model,
        outputTextLength: result.outputText.length,
        durationMs: Date.now() - startedAt,
      })
    } catch (error) {
      const response = toLlmErrorResponse(error)
      console.error("[desengine][task-start] llm_request_failed", {
        taskId,
        durationMs: Date.now() - startedAt,
        status: response.status,
        body: response.body,
      })
      return jsonResult(response.body, response.status)
    }

    let payload: FilesPayload
    try {
      const parsed = extractJson(outputText)
      if (!parsed || typeof parsed !== "object") throw new Error("Ответ не является JSON-объектом")
      payload = normalizeStartPayload(parsed as FilesPayload, fileList, taskData.contentByFileId)
      validateGeneratedFilesPayload(payload, fileList, appConfig.taskWorkbenchFiles, {
        allowBlankFileNames: Object.keys(blankStartFallbackByFileName),
      })
    } catch (error) {
      console.error("[desengine][task-start] parse_failed", {
        taskId,
        durationMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : String(error),
        outputTextPreview: outputText.slice(0, 800),
        outputTextLength: outputText.length,
      })
      return jsonResult(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Не удалось разобрать ответ",
          debug: {
            outputTextPreview: outputText.slice(0, 800),
            outputTextLength: outputText.length,
          },
        },
        500,
      )
    }

    const filteredPayload = filterWorkbenchPayloadByAllowlist(payload, labContext.editableFileIds)
    const writtenFiles: string[] = []
    let cleanup = {
      deletedFileIds: [] as string[],
      deletedFilePaths: [] as string[],
    }

    try {
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

      cleanup = await cleanupForbiddenWorkbenchFiles(taskId, labContext.editableFileIds)
      if (cleanup.deletedFileIds.length > 0) {
        console.log("[desengine][task-start] forbidden_files_deleted", {
          taskId,
          deletedFileIds: cleanup.deletedFileIds,
          deletedFilePaths: cleanup.deletedFilePaths,
        })
      }

      console.log("[desengine][task-start] files_written", {
        taskId,
        writtenFiles,
        durationMs: Date.now() - startedAt,
      })
    } catch (error) {
      console.error("[desengine][task-start] write_error", {
        taskId,
        durationMs: Date.now() - startedAt,
        message: error instanceof Error ? error.message : String(error),
        writtenFiles,
        ignoredFileIds: filteredPayload.ignoredFileIds,
        deletedFileIds: cleanup.deletedFileIds,
        outcome: "write_error",
      })
      return jsonResult(
        {
          ok: false,
          error: "Не удалось сохранить результат initiator-запуска. Повторите попытку.",
          errorKind: "write_error",
        },
        500,
      )
    }

    await clearTaskCheckResult(taskId)
    const progress = await markCurrentTaskLevelInitialized(taskId)
    const nextTaskItem = await getTaskListItemById(taskId)
    const nextLabContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null
    const nextTaskData = await readTaskData({ id: taskId }, nextLabContext)
    console.log("[desengine][task-start] success", {
      taskId,
      writtenFileCount: writtenFiles.length,
      ignoredFileIds: filteredPayload.ignoredFileIds,
      deletedFileIds: cleanup.deletedFileIds,
      durationMs: Date.now() - startedAt,
    })
    return jsonResult({
      ok: true,
      taskData: nextTaskData,
      taskItem: nextTaskItem ? { ...nextTaskItem, progress } : { ...taskItem, progress },
      level,
    })
  })
}

export async function iterateTaskLevel(taskId: string, promptText: string): Promise<TaskActionHttpResult> {
  return runTaskMutation(taskId, async () => {
    if (!promptText) {
      return jsonResult({ ok: false, error: "Введите уточняющий промпт" }, 400)
    }

    const started = await isTaskStarted(taskId)
    if (!started) {
      return jsonResult({ ok: false, error: "Сначала запустите задачу" }, 400)
    }

    const taskItem = await getTaskListItemById(taskId)
    if (!taskItem) {
      return jsonResult({ ok: false, error: "Задание не найдено" }, 404)
    }

    if (taskItem.progress.currentLevelStatus === "completed") {
      return jsonResult({ ok: false, error: "Текущий уровень уже завершён" }, 409)
    }

    if (!taskItem.progress.currentLevelStarted) {
      return jsonResult({ ok: false, error: "Сначала начните текущий уровень" }, 409)
    }

    if (taskItem.progress.promptsUsed >= taskItem.progress.promptsLimit) {
      return jsonResult({ ok: false, error: "Лимит промптов для уровня уже исчерпан" }, 409)
    }

    const labContext = await getTaskLabContext(taskItem)
    const cleanupBeforeIteration = await cleanupForbiddenWorkbenchFiles(taskId, labContext.editableFileIds)
    const promptImages = labContext.images.filter((image) => image.show)
    if (promptImages.length === 0) {
      return jsonResult({ ok: false, error: "Для уровня не настроены картинки для LLM-контекста" }, 400)
    }

    const editableFiles = getLevelEditableWorkbenchFiles(labContext.editableFileIds)
    if (editableFiles.length === 0) {
      return jsonResult({ ok: false, error: "Для уровня не настроены доступные рабочие файлы" }, 400)
    }

    const level = await getLevelForTaskItem(taskItem)
    const taskData = await readTaskData(taskItem, labContext)
    const [defaultProductionPrompt, iterateProductionPrompt, defaultDidacticPrompt, levelSpecifyPrompt] =
      await Promise.all([
        readPrompt("production", "default"),
        readPrompt("production", "iterate-component"),
        readPrompt("didactic", "default"),
        readLevelIteratePrompt(level.id),
      ])

    let imageBase64List: string[]
    try {
      imageBase64List = await Promise.all(
        promptImages.map(async (image) => {
          const imagePath = getTaskCatalogFilePath(taskId, `${image.id}.png`)
          const buf = await readFile(imagePath)
          return buf.toString("base64")
        }),
      )
    } catch {
      return jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404)
    }

    const selectedFiles = editableFiles.map((file) => ({
      id: file.id,
      fileName: file.fileName,
      content: taskData.contentByFileId[file.id] ?? "",
    }))

    const selectedFilesText = selectedFiles
      .map((file) => `FILE ${file.id} (${file.fileName})\n\`\`\`tsx\n${file.content}\n\`\`\``)
      .join("\n\n")

    const imagesText = promptImages
      .map((image) => `- ${image.id}.png — ${image.width}x${image.height}`)
      .join("\n")
    const allowedFilesText = editableFiles
      .map((file) => `- ${file.id} — ${file.fileName}`)
      .join("\n")

    const instruction = `
${defaultProductionPrompt}

${iterateProductionPrompt}

${defaultDidacticPrompt}

${levelSpecifyPrompt}

ОБЩЕЕ ПОЯСНЕНИЕ УРОВНЯ:
${labContext.commonExplanation}

## Разрешённые файлы
${allowedFilesText}

Верни JSON только с ключами из этого списка:
${allowedFilesText}

Для каждого ключа верни одно из двух:
- полный текст файла, если его нужно изменить;
- \`null\`, если этот файл менять не нужно.

Если пользователь просит изменить компонент, не возвращай \`null\` для всех файлов, пока действительно не убедишься, что текущее состояние уже полностью удовлетворяет запросу.

ТЕКУЩИЙ УТОЧНЯЮЩИЙ ПРОМПТ ПОЛЬЗОВАТЕЛЯ:
${promptText}

КАРТИНКИ ТЕКУЩЕГО УРОВНЯ:
${imagesText}

В КОНТЕКСТ ЭТОЙ ИТЕРАЦИИ ВКЛЮЧЕНЫ ВСЕ РАЗРЕШЁННЫЕ РАБОЧИЕ ФАЙЛЫ:
${selectedFilesText}
`.trim()

    let outputText = ""
    let llmCall: Awaited<ReturnType<typeof runStructuredLlmRequest>>
    try {
      llmCall = await runStructuredLlmRequest({
        instruction,
        imageBase64List,
        schemaName: "desengine_iterate_component_files",
        schema: {
          type: "object",
          additionalProperties: false,
          required: editableFiles.map((file) => file.id),
          properties: Object.fromEntries(
            editableFiles.map((file) => [file.id, { type: ["string", "null"] }]),
          ),
        },
      })
      outputText = llmCall.outputText
    } catch (error) {
      const response = toLlmErrorResponse(error)
      return jsonResult(response.body, response.status)
    }

    let payload: NullableFilesPayload
    try {
      const parsed = extractJson(outputText)
      if (!parsed || typeof parsed !== "object") throw new Error("Ответ не является JSON-объектом")
      payload = parsed as NullableFilesPayload
      validateGeneratedFilesPayload(
        payload,
        editableFiles.map((file) => ({ id: file.id, fileName: file.fileName })),
        appConfig.taskWorkbenchFiles,
        { allowNull: true },
      )
    } catch (error) {
      return jsonResult(
        {
          ok: false,
          error: error instanceof Error ? error.message : "Не удалось разобрать ответ",
        },
        500,
      )
    }

    const changedFileIds: string[] = []
    const changedFileNames: string[] = []
    const filteredPayload = filterWorkbenchPayloadByAllowlist(payload, labContext.editableFileIds)
    await ensureUserTaskDir(taskId)

    for (const entry of filteredPayload.allowedEntries) {
      if (typeof entry.content !== "string") continue

      const previousContent = taskData.contentByFileId[entry.fileId] ?? ""
      if (entry.content === previousContent) {
        continue
      }

      const filePath = getUserTaskFilePath(taskId, entry.fileName)
      await writeFile(filePath, entry.content, "utf-8")
      changedFileIds.push(entry.fileId)
      changedFileNames.push(entry.fileName)
    }

    const cleanupAfterIteration = await cleanupForbiddenWorkbenchFiles(taskId, labContext.editableFileIds)

    const createdAt = new Date().toISOString()
    await appendPromptHistory(taskId, {
      text: promptText,
      createdAt,
      displayCreatedAt: formatPromptHistoryTimestamp(createdAt),
      iterationNumber: taskData.promptHistory.length + 1,
      levelNumber: taskItem.progress.currentLevel,
      selectedFileNames: editableFiles.map((file) => file.fileName),
      changedFileIds,
      changedFileNames,
      teachingCostCents: TEACHING_COST_PER_ITERATION_CENTS,
      llmCall: {
        provider: llmCall.provider,
        model: llmCall.model,
        metrics: llmCall.metrics,
      },
    })

    if (filteredPayload.ignoredFileIds.length > 0 || cleanupBeforeIteration.deletedFileIds.length > 0 || cleanupAfterIteration.deletedFileIds.length > 0) {
      console.log("[desengine][task-iterate] allowlist_enforced", {
        taskId,
        ignoredFileIds: filteredPayload.ignoredFileIds,
        deletedBeforeIterationFileIds: cleanupBeforeIteration.deletedFileIds,
        deletedAfterIterationFileIds: cleanupAfterIteration.deletedFileIds,
      })
    }

    await clearTaskCheckResult(taskId)

    const progressUpdate = await registerPromptForCurrentLevel(taskId)
    const nextTaskItem = await getTaskListItemById(taskId)
    const nextLabContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null
    const nextTaskData = await readTaskData({ id: taskId }, nextLabContext)
    return jsonResult({
      ok: true,
      taskData: nextTaskData,
      taskItem: nextTaskItem ? { ...nextTaskItem, progress: progressUpdate.summary } : null,
      transition: progressUpdate.transition,
    })
  })
}

export async function checkTaskLevel(taskId: string): Promise<TaskActionHttpResult> {
  return runTaskMutation(taskId, async () => {
    const taskItem = await getTaskListItemById(taskId)

    if (!taskItem) {
      return jsonResult({ ok: false, error: "Задание не найдено" }, 404)
    }

    const started = await isTaskStarted(taskId)
    if (!started) {
      return jsonResult({ ok: false, error: "Сначала запустите задачу" }, 409)
    }

    if (!taskItem.progress.currentLevelStarted) {
      return jsonResult(
        { ok: false, error: "Сначала начните текущий уровень" },
        409,
      )
    }

    if (taskItem.progress.currentLevelStatus === "completed") {
      return jsonResult({ ok: false, error: "Текущий уровень уже завершён" }, 409)
    }

    const level = await getLevelForTaskItem(taskItem)
    const labContext = await getTaskLabContext(taskItem)
    const promptImages = labContext.images.filter((image) => image.show)
    if (promptImages.length === 0) {
      return jsonResult({ ok: false, error: "Для уровня не настроены картинки для проверки" }, 400)
    }

    const editableFiles = getLevelEditableWorkbenchFiles(labContext.editableFileIds)
    if (editableFiles.length === 0) {
      return jsonResult({ ok: false, error: "Для уровня не настроены доступные рабочие файлы" }, 400)
    }

    const taskData = await readTaskData(taskItem, labContext)
    const [defaultProductionPrompt, defaultDidacticPrompt, levelCheckPrompt] = await Promise.all([
      readPrompt("production", "default"),
      readPrompt("didactic", "default"),
      readLevelCheckPrompt(level.id),
    ])

    let imageBase64List: string[]
    try {
      imageBase64List = await Promise.all(
        promptImages.map(async (image) => {
          const imagePath = getTaskCatalogFilePath(taskId, `${image.id}.png`)
          const buf = await readFile(imagePath)
          return buf.toString("base64")
        }),
      )
    } catch {
      return jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404)
    }

    const allowedFilesText = editableFiles
      .map((file) => `- ${file.id} — ${file.fileName}`)
      .join("\n")
    const selectedFilesText = editableFiles
      .map((file) => `FILE ${file.id} (${file.fileName})\n\`\`\`tsx\n${taskData.contentByFileId[file.id] ?? ""}\n\`\`\``)
      .join("\n\n")
    const imagesText = promptImages
      .map((image) => `- ${image.id}.png — ${image.width}x${image.height}`)
      .join("\n")

    const instruction = `
${defaultProductionPrompt}

${defaultDidacticPrompt}

${levelCheckPrompt}

ОБЩЕЕ ПОЯСНЕНИЕ УРОВНЯ:
${labContext.commonExplanation}

ПРОВЕРЬ РЕЗУЛЬТАТ ТЕКУЩЕГО УРОВНЯ.
Используй только содержательный итог.

Верни JSON со строгой схемой:
- \`passed\`: boolean
- \`message\`: string

\`message\` должно быть кратким, понятным пользователю и на русском языке.

РАЗРЕШЁННЫЕ РАБОЧИЕ ФАЙЛЫ:
${allowedFilesText}

КАРТИНКИ ТЕКУЩЕГО УРОВНЯ:
${imagesText}

ТЕКУЩЕЕ СОСТОЯНИЕ РАБОЧИХ ФАЙЛОВ:
${selectedFilesText}
`.trim()

    let checkResponse: { passed: boolean; message: string }
    try {
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

      checkResponse = {
        passed: parsed.passed,
        message: parsed.message.trim(),
      }
    } catch (error) {
      const progress = await markCurrentTaskLevelCheckTechnicalError(taskId)
      const result: TaskCheckResult = {
        taskId,
        levelId: level.id,
        levelNumber: level.number,
        levelTitle: level.title,
        attemptNumber: taskItem.progress.checkAttemptsUsed + 1,
        maxCheckAttempts: level.maxCheckAttempts,
        passed: false,
        message: buildTechnicalErrorMessage(error),
        kind: "technical_error",
        createdAt: new Date().toISOString(),
      }

      await saveTaskCheckResult(result)

      const nextTaskItem = await getTaskListItemById(taskId)
      if (!nextTaskItem) {
        return jsonResult({ ok: false, error: "Задание не найдено" }, 404)
      }

      const taskResponse = await buildTaskResponse(taskId, {
        ...nextTaskItem,
        progress,
      })

      return jsonResult({
        ok: true,
        taskItem: { ...nextTaskItem, progress },
        taskData: taskResponse.taskData,
        started: taskResponse.started,
        checkResult: result,
        transition: null,
      })
    }

    await clearTaskCheckResult(taskId)

    if (checkResponse.passed) {
      const progressUpdate = await passCurrentTaskLevelCheck(taskId)
      const result: TaskCheckResult = {
        taskId,
        levelId: level.id,
        levelNumber: level.number,
        levelTitle: level.title,
        attemptNumber: progressUpdate.attemptNumber,
        maxCheckAttempts: progressUpdate.maxCheckAttempts,
        passed: true,
        message: checkResponse.message,
        kind: "passed",
        createdAt: new Date().toISOString(),
      }

      await saveTaskCheckResult(result)

      const nextTaskItem = await getTaskListItemById(taskId)
      if (!nextTaskItem) {
        return jsonResult({ ok: false, error: "Задание не найдено" }, 404)
      }

      const taskResponse = await buildTaskResponse(taskId, {
        ...nextTaskItem,
        progress: progressUpdate.summary,
      })

      return jsonResult({
        ok: true,
        taskItem: { ...nextTaskItem, progress: progressUpdate.summary },
        taskData: taskResponse.taskData,
        started: taskResponse.started,
        checkResult: result,
        transition: progressUpdate.transition,
      })
    }

    const failureUpdate = await failCurrentTaskLevelCheck(taskId)
    const result: TaskCheckResult = {
      taskId,
      levelId: level.id,
      levelNumber: level.number,
      levelTitle: level.title,
      attemptNumber: failureUpdate.attemptNumber,
      maxCheckAttempts: failureUpdate.maxCheckAttempts,
      passed: false,
      message: checkResponse.message,
      kind: failureUpdate.reset ? "failed_and_reset" : "failed",
      createdAt: new Date().toISOString(),
    }

    await saveTaskCheckResult(result)

    const nextTaskItem = await getTaskListItemById(taskId)
    if (!nextTaskItem) {
      return jsonResult({ ok: false, error: "Задание не найдено" }, 404)
    }

    const taskResponse = await buildTaskResponse(taskId, failureUpdate.summary
      ? { ...nextTaskItem, progress: failureUpdate.summary }
      : nextTaskItem)

    return jsonResult({
      ok: true,
      taskItem: failureUpdate.summary
        ? { ...nextTaskItem, progress: failureUpdate.summary }
        : nextTaskItem,
      taskData: taskResponse.taskData,
      started: taskResponse.started,
      checkResult: result,
      transition: null,
    })
  })
}

export async function saveTaskFiles(
  taskId: string,
  updates: TaskFileUpdate[],
): Promise<SaveTaskFilesResult> {
  return runTaskMutation(taskId, async () => {
    const taskItem = await getTaskListItemById(taskId)

    if (!taskItem) {
      return { kind: "not_found", error: "Задание не найдено" }
    }

    const labContext = await getTaskLabContext(taskItem)
    const editable = getLevelEditableWorkbenchFileMap(labContext.editableFileIds)
    const errors: Array<{ fileId: string; error: string }> = []
    let written = 0

    await ensureUserTaskDir(taskId)

    for (const update of updates) {
      if (!update || typeof update.fileId !== "string") continue

      const fileName = editable.get(update.fileId)
      if (!fileName) continue
      if (fileName.toLowerCase().endsWith(".png")) continue

      const filePath = getUserTaskFilePath(taskId, fileName)

      try {
        await writeFile(filePath, update.content ?? "", "utf-8")
        written += 1
      } catch (error) {
        errors.push({
          fileId: update.fileId,
          error: error instanceof Error ? error.message : "Ошибка записи файла",
        })
      }
    }

    if (errors.length) {
      return { kind: "write_failed", written, errors }
    }

    return { kind: "saved", written }
  })
}

export async function resetTaskRuntime(
  taskId: string,
): Promise<ResetTaskRuntimeResult> {
  return runTaskMutation(taskId, async () => {
    const taskItem = await getTaskListItemById(taskId)

    if (!taskItem) {
      return { kind: "not_found", error: "Задание не найдено" }
    }

    await resetTask(taskId)
    await clearTaskCheckResult(taskId)

    const nextTaskItem = await getTaskListItemById(taskId)
    const labContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null

    return {
      kind: "reset",
      taskItem: nextTaskItem,
      taskData: nextTaskItem ? createEmptyTaskData(taskId, labContext) : null,
      started: false,
    }
  })
}
