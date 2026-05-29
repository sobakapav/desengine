import "server-only"

import { readLevelCommonExplanation } from "@/lib/prompt/server"
import { appConfig } from "@/lib/system/config/server"

import type {
  LevelConfig,
} from "../level/types"
import { readTaskImageDataUrl } from "./image-source"
import type { TaskConfig, TaskLabContext } from "./types"
import { taskServerStorage } from "./server-runtime-storage"

function requireLevel(levels: LevelConfig[], levelNumber: number) {
  const level = levels.find((item) => item.number === levelNumber)
  if (!level) {
    throw new Error(`Уровень ${levelNumber} не найден в каталоге`)
  }
  return level
}

function requireTaskImage(taskConfig: TaskConfig, imageId: string) {
  const images = taskConfig.images as Record<string, { width: number; height: number }>
  const image = images[imageId]
  if (!image) {
    throw new Error(`Для картинки "${imageId}" не заданы размеры в config.json`)
  }

  return image
}

function normalizeEditableFileIds(level: LevelConfig) {
  const knownFileIds = new Set(appConfig.taskWorkbenchFiles.map((file) => file.id))
  return level.editableFileIds.filter((fileId) => knownFileIds.has(fileId))
}

async function buildTaskLabContext(
  taskId: string,
  level: LevelConfig,
  taskConfig: TaskConfig,
): Promise<TaskLabContext> {
  const [commonExplanation, taskTip, taskCheckContract] = await Promise.all([
    readLevelCommonExplanation(level.id, level.description),
    taskServerStorage.readTaskLevelTip(taskId, level, taskConfig),
    taskServerStorage.readTaskLevelCheckContract(taskId, level, taskConfig),
  ])
  const images = await Promise.all(level.images.map(async (imageConfig) => {
    const size = requireTaskImage(taskConfig, imageConfig.id)
    const inlineSrc = await readTaskImageDataUrl(taskId, imageConfig.id)

    return {
      id: imageConfig.id,
      src: inlineSrc ?? `/api/tasks/${taskId}/image?imageId=${encodeURIComponent(imageConfig.id)}`,
      width: size.width,
      height: size.height,
      show: imageConfig.show,
    }
  }))

  return {
    levelId: level.id,
    levelNumber: level.number,
    labId: level.labId,
    commonExplanation,
    taskTip,
    taskCheckContract,
    editableFileIds: normalizeEditableFileIds(level),
    images,
  }
}

export const taskServerModel = {
  requireLevel,
  requireTaskImage,
  normalizeEditableFileIds,
  buildTaskLabContext,
}
