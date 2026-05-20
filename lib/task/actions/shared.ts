import "server-only"

import { isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import { createEmptyTaskData } from "@/lib/task/data"

import { readTaskImageBuffer } from "../image-source"
import { getTaskLabContext } from "../server"
import type { TaskData, TaskLabContext, TaskListItem } from "../types"
import type {
  FilesPayload,
  OutputFile,
  TaskActionHttpResult,
} from "./types"

const blankStartFallbackByFileName: Record<string, string> = {
  "styles.ts": "export {};",
  "mock.ts": "export const mock = {};",
  "props.ts": "export {};",
}

export const taskActionShared = {
  blankStartFallbackByFileName,
  jsonResult(body: unknown, status?: number): TaskActionHttpResult {
    return { body, status }
  },
  extractJson(text: string): unknown {
    const trimmed = (text || "").trim()
    if (!trimmed) return null

    const fenced = trimmed.match(/```json\s*([\s\S]*?)\s*```/i)
    const candidate = fenced ? fenced[1] : trimmed

    return JSON.parse(candidate)
  },
  normalizeStartPayload(
    payload: FilesPayload,
    outputFiles: OutputFile[],
    currentContentByFileId: Record<string, string>,
  ): FilesPayload {
    const normalizedEntries = outputFiles.map((file) => {
      const rawContent = payload[file.id]

      if (typeof rawContent !== "string" || rawContent.trim()) {
        return [file.id, rawContent] as const
      }

      const existingContent = currentContentByFileId[file.id]?.trim()
      if (existingContent) {
        return [file.id, currentContentByFileId[file.id]] as const
      }

      return [file.id, blankStartFallbackByFileName[file.fileName] ?? rawContent] as const
    })

    return Object.fromEntries(normalizedEntries)
  },
  formatAllowedFilesText(files: OutputFile[]) {
    return files.map((file) => `- ${file.id} — ${file.fileName}`).join("\n")
  },
  getRelevantCurrentFiles(files: OutputFile[], contentByFileId: Record<string, string>) {
    return files
      .map((file) => ({
        ...file,
        content: contentByFileId[file.id] ?? "",
      }))
      .filter((file) => file.content.trim().length > 0)
  },
  formatFilesContextText(files: Array<OutputFile & { content: string }>) {
    return files
      .map((file) => `FILE ${file.id} (${file.fileName})\n\`\`\`tsx\n${file.content}\n\`\`\``)
      .join("\n\n")
  },
  buildTechnicalErrorMessage(error: unknown) {
    if (error instanceof Error && error.message.trim()) {
      return `Проверка уровня временно недоступна: ${error.message}`
    }

    return "Проверка уровня временно недоступна. Повторите попытку ещё раз."
  },
  async readPromptImages(taskId: string, images: TaskLabContext["images"]) {
    return Promise.all(
      images.map(async (image) => {
        const asset = await readTaskImageBuffer(taskId, image.id)
        if (!asset) {
          throw new Error(`Не удалось прочитать картинку "${image.id}" для задачи "${taskId}"`)
        }

        return asset.buffer.toString("base64")
      }),
    )
  },
  async buildTaskResponse(taskId: string, taskItem: TaskListItem) {
    const started = await isTaskStarted(taskId)
    const labContext = await getTaskLabContext(taskItem)

    return {
      started,
      taskData: started
        ? await readTaskData(taskItem, labContext)
        : createEmptyTaskData(taskId, labContext),
    }
  },
}

export type LoadedTaskFiles = {
  taskData: TaskData
  editableFiles: OutputFile[]
  promptImages: TaskLabContext["images"]
}
