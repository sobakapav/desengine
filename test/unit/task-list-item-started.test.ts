import { describe, expect, it } from "vitest"

import type { LevelConfig } from "../../lib/level/types"
import { taskServerProgress } from "../../lib/task/server-runtime-progress"
import type { TaskConfig, TaskProgress } from "../../lib/task/types"

const levels: LevelConfig[] = [
  {
    id: "level-1",
    number: 1,
    title: "Уровень 1",
    description: "Первый уровень",
    url: undefined,
    layoutKey: "level-1",
    maxPromptsPerTask: 3,
    maxCheckAttempts: 2,
    labId: "level-1",
    images: [{ id: "base", show: true }],
    editableFileIds: ["component"],
  },
  {
    id: "level-2",
    number: 2,
    title: "Уровень 2",
    description: "Второй уровень",
    url: undefined,
    layoutKey: "level-2",
    maxPromptsPerTask: 3,
    maxCheckAttempts: 2,
    labId: "level-2",
    images: [{ id: "base", show: true }],
    editableFileIds: ["component"],
  },
  {
    id: "level-3",
    number: 3,
    title: "Уровень 3",
    description: "Третий уровень",
    url: undefined,
    layoutKey: "level-3",
    maxPromptsPerTask: 2,
    maxCheckAttempts: 3,
    labId: "level-3",
    images: [{ id: "base", show: true }],
    editableFileIds: ["component", "styles"],
  },
]

const taskConfig: TaskConfig = {
  image: { width: 100, height: 100 },
  base: { width: 100, height: 100 },
  variants: null,
  images: { base: { width: 100, height: 100 } },
  maxLevel: 3,
}

describe("taskServerProgress.buildTaskListItem", () => {
  it("помечает задачу как начатую, если текущий уровень уже in-progress даже при legacy-drift уровня 1", () => {
    const progress: TaskProgress = {
      currentLevel: 3,
      levels: {
        "1": {
          status: "available",
          isPassed: false,
          promptsUsed: 0,
          checkAttemptsUsed: 0,
          checkingState: "idle",
        },
        "2": {
          status: "completed",
          isPassed: true,
          promptsUsed: 2,
          initializedAt: "2026-05-28T09:02:00.000Z",
          completedAt: "2026-05-28T09:03:00.000Z",
          checkAttemptsUsed: 1,
          checkingState: "idle",
        },
        "3": {
          status: "in_progress",
          isPassed: false,
          promptsUsed: 0,
          initializedAt: "2026-05-28T09:04:00.000Z",
          checkAttemptsUsed: 0,
          checkingState: "idle",
        },
      },
    }

    const taskItem = taskServerProgress.buildTaskListItem(
      {
        id: "mp-inspector-progress-container",
        config: taskConfig,
      },
      levels,
      progress,
    )

    expect(taskItem.started).toBe(true)
    expect(taskItem.progress.currentLevelStarted).toBe(true)
    expect(taskItem.progress.currentLevel).toBe(3)
  })
})
