import "server-only"

import { writeFile } from "node:fs/promises"

import { createEmptyTaskData } from "@/lib/task/data"
import { runTaskMutation } from "@/lib/task/mutation-boundary"
import {
  clearTaskCheckResult,
  getTaskLabContext,
  getTaskListItemById,
  resetCurrentTaskLevel,
  resetTask,
} from "@/lib/task/server"
import {
  ensureUserTaskDir,
  getUserTaskFilePath,
} from "@/lib/user/server"

import { getLevelEditableWorkbenchFileMap } from "../../lab/workbench"
import type {
  ResetCurrentTaskLevelRuntimeResult,
  ResetTaskRuntimeResult,
  SaveTaskFilesResult,
  TaskFileUpdate,
} from "./types"

export const taskFilesAction = {
  async saveTaskFiles(
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
  },
  async resetTaskRuntime(taskId: string): Promise<ResetTaskRuntimeResult> {
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
  },
  async resetCurrentTaskLevelRuntime(taskId: string): Promise<ResetCurrentTaskLevelRuntimeResult> {
    return runTaskMutation(taskId, async () => {
      const taskItem = await getTaskListItemById(taskId)

      if (!taskItem) {
        return { kind: "not_found", error: "Задание не найдено" }
      }

      try {
        const progress = await resetCurrentTaskLevel(taskId)
        const nextTaskItem = await getTaskListItemById(taskId)
        const labContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null

        return {
          kind: "level_reset",
          taskItem: nextTaskItem ? { ...nextTaskItem, progress } : nextTaskItem,
          taskData: nextTaskItem ? createEmptyTaskData(taskId, labContext) : null,
          started: Boolean(nextTaskItem?.started),
        }
      } catch (error) {
        return {
          kind: "snapshot_missing",
          error: error instanceof Error ? error.message : "Не удалось сбросить текущий уровень",
        }
      }
    })
  },
}
