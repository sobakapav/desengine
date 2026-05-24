import "server-only"

import { isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import { createEmptyTaskData } from "@/lib/task/data"

import type { TaskListItem } from "./types"
import type { TaskLabContext } from "./types"

type BuildCurrentTaskScreenDataArgs = {
  taskId: string
  taskItem: TaskListItem
  labContext: TaskLabContext
}

/**
 * Для ещё не начатого текущего уровня возвращаем пустой taskData, даже если
 * по задаче уже остались рабочие файлы от предыдущего уровня.
 */
export async function buildCurrentTaskScreenData({
  taskId,
  taskItem,
  labContext,
}: BuildCurrentTaskScreenDataArgs) {
  const started = await isTaskStarted(taskId)
  const shouldReuseSavedTaskData = started && taskItem.progress.currentLevelStarted

  return {
    started,
    taskData: shouldReuseSavedTaskData
      ? await readTaskData(taskItem, labContext)
      : createEmptyTaskData(taskId, labContext),
  }
}
