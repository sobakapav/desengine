// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь смотрит на историю уточняющих промптов"

import { beforeEach, describe, expect, it, vi } from "vitest"

import type { PromptHistoryEntry } from "@/lib/prompt/types"
import type { UserProgressStore } from "@/lib/user/types"

const mocks = vi.hoisted(() => ({
  readPromptHistory: vi.fn(),
  readTaskCheckResult: vi.fn(),
  removeTaskCheckResult: vi.fn(),
  removeUserTaskDir: vi.fn(),
  readTaskConfig: vi.fn(),
  readTaskLevelSnapshot: vi.fn(),
  readUserProgressStore: vi.fn(),
  restoreTaskLevelSnapshot: vi.fn(),
  writePromptHistory: vi.fn(),
  writeUserProgressStore: vi.fn(),
  getLevelsCatalog: vi.fn(),
  buildTransition: vi.fn(),
}))

vi.mock("@/lib/onboarding/repository", () => ({
  readPromptHistory: mocks.readPromptHistory,
  writePromptHistory: mocks.writePromptHistory,
}))

vi.mock("@/lib/user/server", () => ({
  removeTaskCheckResult: mocks.removeTaskCheckResult,
  removeUserTaskDir: mocks.removeUserTaskDir,
}))

vi.mock("@/lib/task/server-runtime-storage", () => ({
  taskServerStorage: {
    readTaskConfig: mocks.readTaskConfig,
    readTaskCheckResult: mocks.readTaskCheckResult,
    readUserProgressStore: mocks.readUserProgressStore,
    writeUserProgressStore: mocks.writeUserProgressStore,
  },
}))

vi.mock("@/lib/task/level-reset-storage", () => ({
  readTaskLevelSnapshot: mocks.readTaskLevelSnapshot,
  restoreTaskLevelSnapshot: mocks.restoreTaskLevelSnapshot,
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
    mocks.readTaskCheckResult.mockResolvedValue(null)
    mocks.readTaskLevelSnapshot.mockResolvedValue({
      levelNumber: 2,
      editableFileIds: ["component"],
      contentByFileId: {
        component: "export default function Component() { return <button>level 1</button> }",
      },
    })
    mocks.restoreTaskLevelSnapshot.mockResolvedValue(undefined)
    mocks.writePromptHistory.mockResolvedValue(undefined)
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

describe("taskServerMutations.resetCurrentTaskLevel", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    const store: UserProgressStore = {
      tasks: {
        "task-a": {
          currentLevel: 2,
          updatedAt: "2026-05-24T10:09:00.000Z",
          levels: {
            "1": {
              status: "completed",
              isPassed: true,
              promptsUsed: 1,
              initializedAt: "2026-05-24T09:00:00.000Z",
              completedAt: "2026-05-24T09:10:00.000Z",
              checkAttemptsUsed: 1,
              checkingState: "idle",
            },
            "2": {
              status: "in_progress",
              isPassed: false,
              promptsUsed: 2,
              initializedAt: "2026-05-24T10:00:00.000Z",
              checkAttemptsUsed: 1,
              checkingState: "awaiting_retry",
            },
            "3": {
              status: "available",
              isPassed: false,
              promptsUsed: 0,
              checkAttemptsUsed: 0,
              checkingState: "idle",
            },
          },
        },
      },
    }

    const promptHistory: PromptHistoryEntry[] = [
      {
        text: "Уточнение для уровня 1",
        createdAt: "2026-05-24T09:05:00.000Z",
        levelNumber: 1,
      },
      {
        text: "Первое уточнение для уровня 2",
        createdAt: "2026-05-24T10:05:00.000Z",
        levelNumber: 2,
      },
      {
        text: "Второе уточнение для уровня 2",
        createdAt: "2026-05-24T10:06:00.000Z",
        levelNumber: 2,
      },
    ]

    mocks.readPromptHistory.mockResolvedValue(promptHistory)
    mocks.readTaskConfig.mockResolvedValue({
      image: { width: 100, height: 100 },
      base: { width: 100, height: 100 },
      variants: null,
      images: { base: { width: 100, height: 100 } },
      maxLevel: 3,
    })
    mocks.readUserProgressStore.mockResolvedValue(store)
    mocks.readTaskCheckResult.mockResolvedValue({
      taskId: "task-a",
      levelId: "level-2",
      levelNumber: 2,
      levelTitle: "Уровень 2",
      attemptNumber: 1,
      maxCheckAttempts: 2,
      passed: false,
      message: "Нужна ещё одна правка",
      kind: "failed",
      createdAt: "2026-05-24T10:07:00.000Z",
    })
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
        maxCheckAttempts: 2,
        labId: "level-3",
        images: [{ id: "base", show: true }],
        editableFileIds: ["component", "styles"],
      },
    ])
    mocks.buildTransition.mockResolvedValue(null)
  })

  it("сбрасывает только текущий уровень и сохраняет пройденные уровни", async () => {
    const { taskServerMutations } = await import("@/lib/task/server-runtime-mutations")

    await taskServerMutations.resetCurrentTaskLevel("task-a")

    expect(mocks.removeUserTaskDir).not.toHaveBeenCalled()
    expect(mocks.removeTaskCheckResult).toHaveBeenCalledWith("task-a")
    expect(mocks.restoreTaskLevelSnapshot).toHaveBeenCalledWith(
      "task-a",
      expect.objectContaining({ levelNumber: 2 }),
      ["component"],
    )
    expect(mocks.writePromptHistory).toHaveBeenCalledWith("task-a", [
      expect.objectContaining({ text: "Уточнение для уровня 1", levelNumber: 1 }),
    ])
    expect(mocks.writeUserProgressStore).toHaveBeenCalledWith(expect.objectContaining({
      tasks: {
        "task-a": expect.objectContaining({
          currentLevel: 2,
          levels: {
            "1": expect.objectContaining({
              status: "completed",
              isPassed: true,
              promptsUsed: 1,
            }),
            "2": expect.objectContaining({
              status: "available",
              isPassed: false,
              promptsUsed: 0,
              checkAttemptsUsed: 0,
              checkingState: "idle",
            }),
            "3": expect.objectContaining({
              status: "available",
              isPassed: false,
            }),
          },
        }),
      },
    }))
    expect(mocks.writeUserProgressStore.mock.calls[0]?.[0]?.tasks?.["task-a"]?.levels?.["2"]).not.toHaveProperty("initializedAt")
    expect(mocks.writeUserProgressStore.mock.calls[0]?.[0]?.tasks?.["task-a"]?.levels?.["2"]).not.toHaveProperty("completedAt")
  })

  it("сохраняет результат уже завершённого уровня при reset текущего", async () => {
    mocks.readTaskCheckResult.mockResolvedValueOnce({
      taskId: "task-a",
      levelId: "level-1",
      levelNumber: 1,
      levelTitle: "Уровень 1",
      attemptNumber: 1,
      maxCheckAttempts: 2,
      passed: true,
      message: "Уровень пройден",
      kind: "passed",
      createdAt: "2026-05-24T09:10:00.000Z",
    })

    const { taskServerMutations } = await import("@/lib/task/server-runtime-mutations")

    await taskServerMutations.resetCurrentTaskLevel("task-a")

    expect(mocks.removeTaskCheckResult).not.toHaveBeenCalled()
    expect(mocks.writePromptHistory).toHaveBeenCalledWith("task-a", [
      expect.objectContaining({ text: "Уточнение для уровня 1", levelNumber: 1 }),
    ])
  })
})

describe("taskServerMutations.resetTask", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.readUserProgressStore.mockResolvedValue({
      tasks: {
        "task-a": {
          currentLevel: 2,
          levels: {
            "1": {
              status: "completed",
              isPassed: true,
              promptsUsed: 1,
              checkAttemptsUsed: 1,
              checkingState: "idle",
            },
            "2": {
              status: "in_progress",
              isPassed: false,
              promptsUsed: 2,
              checkAttemptsUsed: 1,
              checkingState: "awaiting_retry",
            },
          },
        },
      },
    })
    mocks.writeUserProgressStore.mockResolvedValue(undefined)
  })

  it("удаляет runtime состояния задачи при обычном reset", async () => {
    const { taskServerMutations } = await import("@/lib/task/server-runtime-mutations")

    await taskServerMutations.resetTask("task-a")

    expect(mocks.removeUserTaskDir).toHaveBeenCalledWith("task-a")
    expect(mocks.removeTaskCheckResult).toHaveBeenCalledWith("task-a")
    expect(mocks.writeUserProgressStore).toHaveBeenCalledWith({ tasks: {} })
  })

  it("сохраняет check-result только в explicit preserve-режиме", async () => {
    const { taskServerMutations } = await import("@/lib/task/server-runtime-mutations")

    await taskServerMutations.resetTask("task-a", { preserveCheckResult: true })

    expect(mocks.removeUserTaskDir).toHaveBeenCalledWith("task-a")
    expect(mocks.removeTaskCheckResult).not.toHaveBeenCalled()
    expect(mocks.writeUserProgressStore).toHaveBeenCalledWith({ tasks: {} })
  })
})
