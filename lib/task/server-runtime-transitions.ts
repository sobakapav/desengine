import "server-only"

import { readPromptHistory } from "@/lib/onboarding/repository"

import type { LevelConfig } from "../level/types"
import type { TaskTransition } from "./types"
import { taskServerModel } from "./server-runtime-model"
import { taskServerOverview } from "./server-runtime-overview"
import { taskServerProgress } from "./server-runtime-progress"
import { taskServerStorage } from "./server-runtime-storage"

async function buildTransition(
  levels: LevelConfig[],
  taskId: string,
  fromLevelNumber: number,
  toLevelNumber: number | null,
): Promise<TaskTransition> {
  const fromLevel = taskServerModel.requireLevel(levels, fromLevelNumber)
  const toLevel = toLevelNumber === null ? null : taskServerModel.requireLevel(levels, toLevelNumber)
  const [fromTaskTip, toTaskTip] = await Promise.all([
    taskServerStorage.readTaskLevelTip(taskId, fromLevel.id),
    toLevel ? taskServerStorage.readTaskLevelTip(taskId, toLevel.id) : Promise.resolve(null),
  ])

  return { taskId, fromLevel, toLevel, fromTaskTip, toTaskTip }
}

async function loadProgressContext(taskId: string) {
  const [levels, store, taskConfig, promptHistory] = await Promise.all([
    taskServerOverview.getLevelsCatalog(),
    taskServerStorage.readUserProgressStore(),
    taskServerStorage.readTaskConfig(taskId),
    readPromptHistory(taskId),
  ])

  const taskProgress = taskServerProgress.ensureTaskProgress(store, taskId, taskConfig.maxLevel)
  taskServerProgress.reconcileTaskProgressWithHistory(levels, taskConfig, taskProgress, promptHistory)
  return { levels, taskConfig, taskProgress }
}

export const taskServerTransitions = {
  buildTransition,
  async getTaskPendingTransition(taskId: string): Promise<TaskTransition | null> {
    const { levels, taskProgress } = await loadProgressContext(taskId)
    const currentLevelNumber = taskProgress.currentLevel
    const currentLevelProgress = taskProgress.levels[String(currentLevelNumber)]

    if (currentLevelNumber <= 1) return null

    if (
      currentLevelProgress?.promptsUsed > 0
      || Boolean(currentLevelProgress?.initializedAt)
      || currentLevelProgress?.status === "in_progress"
      || currentLevelProgress?.status === "completed"
    ) {
      return null
    }

    const previousLevelNumber = currentLevelNumber - 1
    const previousLevelProgress = taskProgress.levels[String(previousLevelNumber)]
    if (!previousLevelProgress || previousLevelProgress.status !== "completed") return null

    return buildTransition(levels, taskId, previousLevelNumber, currentLevelNumber)
  },
  async getTaskDoneTransition(taskId: string): Promise<TaskTransition | null> {
    const { levels, taskConfig, taskProgress } = await loadProgressContext(taskId)
    const currentLevelNumber = taskProgress.currentLevel
    const currentLevelProgress = taskProgress.levels[String(currentLevelNumber)]

    if (currentLevelNumber !== taskConfig.maxLevel || currentLevelProgress?.status !== "completed") {
      return null
    }

    return buildTransition(levels, taskId, currentLevelNumber, null)
  },
  async getTaskLabContext(taskItem: NonNullable<Awaited<ReturnType<typeof taskServerOverview.getTaskListItemById>>>) {
    const [levels, taskConfig] = await Promise.all([
      taskServerOverview.getLevelsCatalog(),
      taskServerStorage.readTaskConfig(taskItem.id),
    ])

    const level = taskServerModel.requireLevel(levels, taskItem.progress.currentLevel)
    return taskServerModel.buildTaskLabContext(taskItem.id, level, taskConfig)
  },
}
