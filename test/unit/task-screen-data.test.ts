// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает стартовый экран уровня 2+ задачи"
// @openSpec  - "Система показывает task-specific пояснение уровня пользователю"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь сбрасывает задачу"
// @openSpec capability: task-levels
// @openSpec scenarios:
// @openSpec  - "Пользователь впервые входит в новый уровень задачи"

import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  createEmptyTaskData: vi.fn(),
  isTaskStarted: vi.fn(),
  readTaskData: vi.fn(),
}))

vi.mock("@/lib/onboarding/repository", () => ({
  isTaskStarted: mocks.isTaskStarted,
  readTaskData: mocks.readTaskData,
}))

vi.mock("@/lib/task/data", () => ({
  createEmptyTaskData: mocks.createEmptyTaskData,
}))

const taskItem = {
  id: "task-a",
  image: { width: 100, height: 100 },
  started: true,
  maxLevel: 3,
  progress: {
    currentLevel: 2,
    currentLevelId: "level-2",
    currentLevelStatus: "available",
    currentLevelDisplayStatus: "available",
    currentLevelStarted: false,
    currentLevelNotStarted: true,
    promptsUsed: 0,
    promptsLimit: 4,
    promptsRemaining: 4,
    checkAttemptsUsed: 0,
    checkAttemptsLimit: 2,
    checkingState: "idle",
    maxLevel: 3,
    isCompleted: false,
    hasNextLevel: true,
  },
}

const startedTaskItem = {
  ...taskItem,
  progress: {
    ...taskItem.progress,
    currentLevelStarted: true,
    currentLevelNotStarted: false,
    currentLevelStatus: "in_progress" as const,
    currentLevelDisplayStatus: "in_progress" as const,
    promptsUsed: 1,
    promptsRemaining: 3,
  },
}

const labContext = {
  levelId: "level-2",
  levelNumber: 2,
  labId: "level-2",
  commonExplanation: "Общее пояснение",
  taskTip: "Подсказка",
  editableFileIds: ["component"],
  images: [{ id: "base", src: "/api/tasks/task-a/image?imageId=base", width: 100, height: 100, show: true }],
}

describe("buildCurrentTaskScreenData", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.isTaskStarted.mockResolvedValue(true)
    mocks.readTaskData.mockResolvedValue({ source: "saved-task-data" })
    mocks.createEmptyTaskData.mockReturnValue({ source: "empty-task-data" })
  })

  it("для нового текущего уровня возвращает пустой taskData, а не старые файлы задачи", async () => {
    const { buildCurrentTaskScreenData } = await import("@/lib/task/task-screen-data")

    await expect(buildCurrentTaskScreenData({ taskId: "task-a", taskItem, labContext })).resolves.toEqual({
      started: true,
      taskData: { source: "empty-task-data" },
    })

    expect(mocks.createEmptyTaskData).toHaveBeenCalledWith("task-a", labContext)
    expect(mocks.readTaskData).not.toHaveBeenCalled()
  })

  it("для уже начатого текущего уровня читает сохранённые файлы и историю", async () => {
    const { buildCurrentTaskScreenData } = await import("@/lib/task/task-screen-data")

    await expect(buildCurrentTaskScreenData({
      taskId: "task-a",
      taskItem: startedTaskItem,
      labContext,
    })).resolves.toEqual({
      started: true,
      taskData: { source: "saved-task-data" },
    })

    expect(mocks.readTaskData).toHaveBeenCalledWith(startedTaskItem, labContext)
    expect(mocks.createEmptyTaskData).not.toHaveBeenCalled()
  })

  it("после reset возвращает пустой taskData даже без пользовательских файлов", async () => {
    const { buildCurrentTaskScreenData } = await import("@/lib/task/task-screen-data")
    mocks.isTaskStarted.mockResolvedValue(false)

    await expect(buildCurrentTaskScreenData({ taskId: "task-a", taskItem, labContext })).resolves.toEqual({
      started: false,
      taskData: { source: "empty-task-data" },
    })

    expect(mocks.createEmptyTaskData).toHaveBeenCalledWith("task-a", labContext)
    expect(mocks.readTaskData).not.toHaveBeenCalled()
  })
})
