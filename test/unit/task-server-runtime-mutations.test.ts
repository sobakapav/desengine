// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь смотрит на историю уточняющих промптов"

import { beforeEach, describe, expect, it, vi } from "vitest"

import type { PromptHistoryEntry } from "@/lib/prompt/types"
import type { UserProgressStore } from "@/lib/user/types"

const mocks = vi.hoisted(() => ({
  readPromptHistory: vi.fn(),
  removeTaskCheckResult: vi.fn(),
  removeUserTaskDir: vi.fn(),
  readTaskConfig: vi.fn(),
  readUserProgressStore: vi.fn(),
  writeUserProgressStore: vi.fn(),
  getLevelsCatalog: vi.fn(),
  buildTransition: vi.fn(),
}))

vi.mock("@/lib/onboarding/repository", () => ({
  readPromptHistory: mocks.readPromptHistory,
}))

vi.mock("@/lib/user/server", () => ({
  removeTaskCheckResult: mocks.removeTaskCheckResult,
  removeUserTaskDir: mocks.removeUserTaskDir,
}))

vi.mock("@/lib/task/server-runtime-storage", () => ({
  taskServerStorage: {
    readTaskConfig: mocks.readTaskConfig,
    readUserProgressStore: mocks.readUserProgressStore,
    writeUserProgressStore: mocks.writeUserProgressStore,
  },
}))

vi.mock("@/lib/task/server-runtime-overview", () => ({
  taskServerOverview: {
    getLevelsCatalog: mocks.getLevelsCatalog,
  },
}))

vi.mock("@/lib/task/server-runtime-transitions", () => ({
  taskServerTransitions: {
    buildTransition: mocks.buildTransition,
  },
}))

describe("taskServerMutations.registerPromptForCurrentLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const store: UserProgressStore = {
      tasks: {
        "task-a": {
          currentLevel: 1,
          levels: {
            "1": {
              status: "in_progress",
              isPassed: false,
              promptsUsed: 0,
              checkAttemptsUsed: 0,
              checkingState: "awaiting_retry",
              initializedAt: "2026-05-24T10:00:00.000Z",
            },
          },
        },
      },
    }

    const promptHistory: PromptHistoryEntry[] = [
      {
        text: "Сделай кнопку заметнее",
        createdAt: "2026-05-24T10:05:00.000Z",
        levelNumber: 1,
      },
    ]

    mocks.readPromptHistory.mockResolvedValue(promptHistory)
    mocks.readTaskConfig.mockResolvedValue({
      image: { width: 100, height: 100 },
      base: { width: 100, height: 100 },
      variants: null,
      images: { base: { width: 100, height: 100 } },
      maxLevel: 1,
    })
    mocks.readUserProgressStore.mockResolvedValue(store)
    mocks.writeUserProgressStore.mockResolvedValue(undefined)
    mocks.getLevelsCatalog.mockResolvedValue([
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
    ])
    mocks.buildTransition.mockResolvedValue(null)
  })

  it("не удваивает promptsUsed, если новый prompt уже попал в prompt-history", async () => {
    const { taskServerMutations } = await import("@/lib/task/server-runtime-mutations")

    const result = await taskServerMutations.registerPromptForCurrentLevel("task-a")

    expect(result.summary.promptsUsed).toBe(1)
    expect(result.summary.promptsRemaining).toBe(2)
    expect(result.summary.checkingState).toBe("idle")
    expect(mocks.writeUserProgressStore).toHaveBeenCalledWith(expect.objectContaining({
      tasks: {
        "task-a": expect.objectContaining({
          levels: {
            "1": expect.objectContaining({
              promptsUsed: 1,
              checkingState: "idle",
            }),
          },
        }),
      },
    }))
  })
})
