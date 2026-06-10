import "server-only"

import {
  cleanupForbiddenWorkbenchFiles,
} from "@/lib/lab/workbench"
import type { Project } from "@/lib/project/runtime"
import { isTaskStarted, readTaskData } from "@/lib/onboarding/repository"
import {
  clearTaskCheckResult,
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
  markTaskLevelInProgress,
} from "@/lib/task/server"

import { taskActionShared } from "./shared"
import type { TaskActionHttpResult } from "./types"

type StartRuntimeContext = {
  project: Project
  taskItem: NonNullable<Awaited<ReturnType<typeof getTaskListItemById>>>
  level: Awaited<ReturnType<typeof getLevelForTaskItem>>
  labContext: Awaited<ReturnType<typeof getTaskLabContext>>
  already: boolean
  promptImages: Awaited<ReturnType<typeof getTaskLabContext>>["images"]
  imageBase64List: string[]
}

async function resumeStartedLevel(
  taskId: string,
  taskItem: StartRuntimeContext["taskItem"],
  project: Project,
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
  const taskData = await readTaskData(taskItem, labContext, project)
  return taskActionShared.jsonResult({ ok: true, taskData, taskItem: { ...taskItem, progress }, level })
}

async function loadStartRuntimeContext(taskId: string, project: Project): Promise<
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
  const already = await isTaskStarted(taskId, project)
  const promptImages = labContext.images.filter((image) => image.show)
  if (promptImages.length === 0) {
    console.error("[desengine][task-start] missing_prompt_images", { taskId })
    return { response: taskActionShared.jsonResult({ ok: false, error: "Для уровня не настроены картинки для LLM-контекста" }, 400) }
  }

  try {
    const imageBase64List = await taskActionShared.readPromptImages(taskId, promptImages)
    return { context: { project, taskItem, level, labContext, already, promptImages, imageBase64List } }
  } catch {
    console.error("[desengine][task-start] missing_required_images", {
      taskId,
      imageIds: promptImages.map((image) => image.id),
    })
    return { response: taskActionShared.jsonResult({ ok: false, error: "Не найдены обязательные картинки текущего уровня" }, 404) }
  }
}

export {
  loadStartRuntimeContext,
  resumeStartedLevel,
  type StartRuntimeContext,
}
