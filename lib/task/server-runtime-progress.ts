import "server-only"

import type { PromptHistoryEntry } from "@/lib/prompt/types"
import type { UserProgressStore } from "@/lib/user/types"

import {
  isLevelStarted,
  summarizeTaskProgress,
} from "./progress"
import type { LevelConfig, LevelOverviewTaskItem } from "../level/types"
import type {
  TaskConfig,
  TaskListItem,
  TaskProgress,
} from "./types"
import type { TaskCatalogItem } from "./server-runtime-types"

function buildInitialTaskProgress(maxLevel: number): TaskProgress {
  const levels: TaskProgress["levels"] = Object.fromEntries(
    Array.from({ length: maxLevel }, (_, index) => {
      const levelNumber = index + 1
      return [
        String(levelNumber),
        {
          status: "available" as const,
          isPassed: false,
          promptsUsed: 0,
          checkAttemptsUsed: 0,
          checkingState: "idle" as const,
        },
      ]
    }),
  )

  return { currentLevel: 1, levels }
}

function normalizeTaskProgress(taskProgress: TaskProgress, maxLevel: number): TaskProgress {
  const nextLevels = { ...taskProgress.levels }

  for (let levelNumber = 1; levelNumber <= maxLevel; levelNumber += 1) {
    const key = String(levelNumber)
    if (!nextLevels[key]) {
      nextLevels[key] = {
        status: "available",
        isPassed: false,
        promptsUsed: 0,
        checkAttemptsUsed: 0,
        checkingState: "idle",
      }
    }
  }

  for (const key of Object.keys(nextLevels)) {
    const levelNumber = Number(key)
    if (!Number.isFinite(levelNumber) || levelNumber > maxLevel) {
      delete nextLevels[key]
    }
  }

  return {
    currentLevel: Math.min(Math.max(taskProgress.currentLevel, 1), maxLevel),
    levels: Object.fromEntries(
      Object.entries(nextLevels).map(([key, level]) => [
        key,
        {
          ...level,
          isPassed: level.isPassed ?? level.status === "completed",
          checkAttemptsUsed: level.checkAttemptsUsed ?? 0,
          checkingState: level.checkingState ?? "idle",
        },
      ]),
    ),
    updatedAt: taskProgress.updatedAt,
  }
}

function countPromptsByLevel(promptHistory: PromptHistoryEntry[]) {
  const counts = new Map<number, number>()
  const firstCreatedAtByLevel = new Map<number, string>()

  for (const entry of promptHistory) {
    const levelNumber = entry.levelNumber ?? 1
    counts.set(levelNumber, (counts.get(levelNumber) ?? 0) + 1)
    if (!firstCreatedAtByLevel.has(levelNumber)) {
      firstCreatedAtByLevel.set(levelNumber, entry.createdAt)
    }
  }

  return { counts, firstCreatedAtByLevel }
}

export const taskServerProgress = {
  normalizePassedFlags(taskProgress: TaskProgress) {
    let changed = false

    for (const levelProgress of Object.values(taskProgress.levels)) {
      const isPassed = Boolean(levelProgress.isPassed || levelProgress.status === "completed")

      if (levelProgress.isPassed !== isPassed) {
        levelProgress.isPassed = isPassed
        changed = true
      }

      if (isPassed && levelProgress.status !== "completed") {
        levelProgress.status = "completed"
        changed = true
      }
    }

    const sortedLevelNumbers = Object.keys(taskProgress.levels)
      .map((key) => Number(key))
      .filter((value) => Number.isFinite(value))
      .sort((a, b) => a - b)
    const maxLevel = sortedLevelNumbers.at(-1) ?? 1
    let highestContiguousPassed = 0

    for (const levelNumber of sortedLevelNumbers) {
      const levelProgress = taskProgress.levels[String(levelNumber)]
      if (levelNumber === highestContiguousPassed + 1 && levelProgress?.isPassed) {
        highestContiguousPassed = levelNumber
        continue
      }

      if (levelNumber > highestContiguousPassed + 1) break
    }

    const expectedCurrentLevel = Math.min(highestContiguousPassed + 1, maxLevel)
    if (expectedCurrentLevel > taskProgress.currentLevel) {
      taskProgress.currentLevel = expectedCurrentLevel
      changed = true
    }

    return changed
  },
  ensureTaskProgress(store: UserProgressStore, taskId: string, maxLevel: number) {
    const existing = store.tasks[taskId]
    const normalized = existing
      ? normalizeTaskProgress(existing, maxLevel)
      : buildInitialTaskProgress(maxLevel)

    store.tasks[taskId] = normalized
    return normalized
  },
  reconcileTaskProgressWithHistory(
    levels: LevelConfig[],
    taskConfig: TaskConfig,
    taskProgress: TaskProgress,
    promptHistory: PromptHistoryEntry[],
  ) {
    const { counts, firstCreatedAtByLevel } = countPromptsByLevel(promptHistory)
    let changed = false

    for (let levelNumber = 1; levelNumber <= taskConfig.maxLevel; levelNumber += 1) {
      const key = String(levelNumber)
      const countedPrompts = counts.get(levelNumber) ?? 0
      const levelProgress = taskProgress.levels[key]

      if (countedPrompts > levelProgress.promptsUsed) {
        levelProgress.promptsUsed = countedPrompts
        changed = true
      }

      if (countedPrompts > 0 && levelProgress.status === "available") {
        levelProgress.status = "in_progress"
        changed = true
      }

      if (countedPrompts > 0 && !levelProgress.initializedAt) {
        levelProgress.initializedAt = firstCreatedAtByLevel.get(levelNumber) ?? new Date().toISOString()
        changed = true
      }
    }

    const currentLevelProgress = taskProgress.levels[String(taskProgress.currentLevel)]
    if (currentLevelProgress?.status === "completed" && taskProgress.currentLevel < taskConfig.maxLevel) {
      const nextLevel = taskProgress.currentLevel + 1
      const nextLevelProgress = taskProgress.levels[String(nextLevel)]

      if (nextLevelProgress && nextLevelProgress.promptsUsed > 0) {
        taskProgress.currentLevel = nextLevel
        changed = true
      }
    }

    if (changed) taskProgress.updatedAt = new Date().toISOString()
    return changed
  },
  buildTaskListItem(task: TaskCatalogItem, levels: LevelConfig[], taskProgress: TaskProgress): TaskListItem {
    return {
      id: task.id,
      image: task.config.image,
      started: isLevelStarted(taskProgress.levels["1"]),
      maxLevel: task.config.maxLevel,
      progress: summarizeTaskProgress(levels, task.config, taskProgress),
    }
  },
  buildPassedTaskItem(taskItem: TaskListItem, nextUnlockedLevel: number | null): LevelOverviewTaskItem {
    return { ...taskItem, nextUnlockedLevel }
  },
}
