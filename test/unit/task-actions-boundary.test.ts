// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь редактирует один файл и переключается на другой"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь сбрасывает задачу"
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Система выполняет start"
// @openSpec  - "Система выполняет iterate"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает уровень через service boundary"
// @openSpec  - "Пользователь уточняет задачу через service boundary"
// @openSpec  - "Пользователь проверяет результат через service boundary"
// @openSpec  - "Пользователь сохраняет рабочие файлы"
// @openSpec  - "Пользователь сбрасывает задачу через service boundary"
// @openSpec  - "Route handlers используют переиспользуемые lab action services"
// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Разработчик проверяет lab runtime после hardening"
// @openSpec  - "Проверка использует временное пользовательское состояние"

import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  appendPromptHistory: vi.fn(),
  clearTaskCheckResult: vi.fn(),
  cleanupForbiddenWorkbenchFiles: vi.fn(),
  failCurrentTaskLevelCheck: vi.fn(),
  filterWorkbenchPayloadByAllowlist: vi.fn(),
  formatPromptHistoryTimestamp: vi.fn(),
  getLevelEditableWorkbenchFileMap: vi.fn(),
  getLevelEditableWorkbenchFiles: vi.fn(),
  getLevelForTaskItem: vi.fn(),
  getTaskLabContext: vi.fn(),
  getTaskListItemById: vi.fn(),
  getUserTaskFilePath: vi.fn(),
  isTaskStarted: vi.fn(),
  markCurrentTaskLevelCheckTechnicalError: vi.fn(),
  markCurrentTaskLevelInitialized: vi.fn(),
  markTaskLevelInProgress: vi.fn(),
  passCurrentTaskLevelCheck: vi.fn(),
  readFile: vi.fn(),
  readLevelCheckPrompt: vi.fn(),
  readLevelIteratePrompt: vi.fn(),
  readLevelStartPrompt: vi.fn(),
  readPrompt: vi.fn(),
  readTaskData: vi.fn(),
  registerPromptForCurrentLevel: vi.fn(),
  resetTask: vi.fn(),
  runStructuredLlmRequest: vi.fn(),
  saveTaskCheckResult: vi.fn(),
  validateGeneratedFilesPayload: vi.fn(),
  writeFile: vi.fn(),
  ensureUserTaskDir: vi.fn(),
}))

vi.mock("node:fs/promises", () => ({
  readFile: mocks.readFile,
  writeFile: mocks.writeFile,
}))

vi.mock("@/lib/lab/workbench", () => ({
  cleanupForbiddenWorkbenchFiles: mocks.cleanupForbiddenWorkbenchFiles,
  filterWorkbenchPayloadByAllowlist: mocks.filterWorkbenchPayloadByAllowlist,
  getLevelEditableWorkbenchFileMap: mocks.getLevelEditableWorkbenchFileMap,
  getLevelEditableWorkbenchFiles: mocks.getLevelEditableWorkbenchFiles,
  validateGeneratedFilesPayload: mocks.validateGeneratedFilesPayload,
}))

vi.mock("@/lib/onboarding/repository", () => ({
  appendPromptHistory: mocks.appendPromptHistory,
  isTaskStarted: mocks.isTaskStarted,
  readTaskData: mocks.readTaskData,
}))

vi.mock("@/lib/prompt/history", () => ({
  formatPromptHistoryTimestamp: mocks.formatPromptHistoryTimestamp,
  TEACHING_COST_PER_ITERATION_CENTS: 50,
}))

vi.mock("@/lib/prompt/server", () => ({
  readLevelCheckPrompt: mocks.readLevelCheckPrompt,
  readLevelIteratePrompt: mocks.readLevelIteratePrompt,
  readLevelStartPrompt: mocks.readLevelStartPrompt,
  readPrompt: mocks.readPrompt,
}))

vi.mock("@/lib/llm/server", () => ({
  runStructuredLlmRequest: mocks.runStructuredLlmRequest,
  toLlmErrorResponse: (error: unknown) => ({
    status: 503,
    body: { ok: false, error: error instanceof Error ? error.message : "LLM недоступна" },
  }),
}))

vi.mock("@/lib/system/config/server", () => ({
  appConfig: {
    taskWorkbenchFiles: [
      { id: "component", fileName: "Component.tsx" },
      { id: "styles", fileName: "styles.ts" },
      { id: "reference", fileName: "reference.png" },
    ],
  },
}))

vi.mock("@/lib/task/server", () => ({
  clearTaskCheckResult: mocks.clearTaskCheckResult,
  failCurrentTaskLevelCheck: mocks.failCurrentTaskLevelCheck,
  getLevelForTaskItem: mocks.getLevelForTaskItem,
  getTaskLabContext: mocks.getTaskLabContext,
  getTaskListItemById: mocks.getTaskListItemById,
  markCurrentTaskLevelCheckTechnicalError: mocks.markCurrentTaskLevelCheckTechnicalError,
  markCurrentTaskLevelInitialized: mocks.markCurrentTaskLevelInitialized,
  markTaskLevelInProgress: mocks.markTaskLevelInProgress,
  passCurrentTaskLevelCheck: mocks.passCurrentTaskLevelCheck,
  registerPromptForCurrentLevel: mocks.registerPromptForCurrentLevel,
  resetTask: mocks.resetTask,
  saveTaskCheckResult: mocks.saveTaskCheckResult,
}))

vi.mock("@/lib/user/server", () => ({
  ensureUserTaskDir: mocks.ensureUserTaskDir,
  getTaskCatalogFilePath: (taskId: string, fileName: string) => `/catalog/${taskId}/${fileName}`,
  getUserTaskFilePath: mocks.getUserTaskFilePath,
}))

const progress = {
  currentLevel: 1,
  currentLevelId: "level-1",
  currentLevelStatus: "in_progress",
  currentLevelDisplayStatus: "in_progress",
  currentLevelStarted: true,
  currentLevelNotStarted: false,
  promptsUsed: 1,
  promptsLimit: 3,
  promptsRemaining: 2,
  checkAttemptsUsed: 0,
  checkAttemptsLimit: 2,
  checkingState: "idle",
  maxLevel: 3,
  isCompleted: false,
  hasNextLevel: true,
}

const taskItem = {
  id: "task-a",
  image: { width: 10, height: 10 },
  started: true,
  maxLevel: 3,
  progress,
}

const labContext = {
  levelId: "level-1",
  levelNumber: 1,
  labId: "intro-lab",
  commonExplanation: "Общее объяснение",
  taskTip: "Подсказка",
  editableFileIds: ["component", "styles", "reference"],
  images: [{ id: "target", src: "/api/tasks/task-a/image?imageId=target", width: 320, height: 240, show: true }],
}

const level = {
  id: "level-1",
  number: 1,
  title: "Уровень 1",
  labId: "intro-lab",
  description: "Описание",
  maxCheckAttempts: 2,
  images: [{ id: "target", show: true }],
  editableFileIds: ["component", "styles"],
}

const editableFiles = [
  { id: "component", fileName: "Component.tsx" },
  { id: "styles", fileName: "styles.ts" },
]

const taskData = {
  taskId: "task-a",
  contentByFileId: {
    component: "export default function Component() { return null }",
    styles: "export {};",
  },
  promptHistory: [],
  llmUsageSummary: {
    totalCalls: 0,
    teachingCostCents: 0,
    providersUsed: [],
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    callsWithoutProviderMetrics: 0,
  },
  labContext,
}

function createLlmCall(outputText: string) {
  return {
    outputText,
    provider: "openai",
    model: "mock-model",
    metrics: { status: "available", inputTokens: 1, outputTokens: 1, totalTokens: 2 },
  }
}

describe("task action service boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.appendPromptHistory.mockResolvedValue(undefined)
    mocks.clearTaskCheckResult.mockResolvedValue(undefined)
    mocks.cleanupForbiddenWorkbenchFiles.mockResolvedValue({ deletedFileIds: [], deletedFilePaths: [] })
    mocks.failCurrentTaskLevelCheck.mockResolvedValue({
      summary: progress,
      attemptNumber: 1,
      maxCheckAttempts: 2,
      reset: false,
    })
    mocks.filterWorkbenchPayloadByAllowlist.mockImplementation((payload: Record<string, string | null>) => ({
      allowedEntries: Object.entries(payload).map(([fileId, content]) => ({
        fileId,
        fileName: fileId === "component" ? "Component.tsx" : "styles.ts",
        content,
      })),
      ignoredFileIds: [],
    }))
    mocks.formatPromptHistoryTimestamp.mockReturnValue("19.05.2026 21:00")
    mocks.getLevelEditableWorkbenchFileMap.mockReturnValue(new Map([
      ["component", "Component.tsx"],
      ["reference", "reference.png"],
    ]))
    mocks.getLevelEditableWorkbenchFiles.mockReturnValue(editableFiles)
    mocks.getLevelForTaskItem.mockResolvedValue(level)
    mocks.getTaskLabContext.mockResolvedValue(labContext)
    mocks.getTaskListItemById.mockResolvedValue(taskItem)
    mocks.getUserTaskFilePath.mockImplementation((taskId: string, fileName: string) => (
      `/user/tasks/${taskId}/${fileName}`
    ))
    mocks.isTaskStarted.mockResolvedValue(true)
    mocks.markCurrentTaskLevelCheckTechnicalError.mockResolvedValue(progress)
    mocks.markCurrentTaskLevelInitialized.mockResolvedValue(progress)
    mocks.markTaskLevelInProgress.mockResolvedValue(progress)
    mocks.passCurrentTaskLevelCheck.mockResolvedValue({
      summary: progress,
      transition: null,
      attemptNumber: 1,
      maxCheckAttempts: 2,
    })
    mocks.readFile.mockResolvedValue(Buffer.from("image-bytes"))
    mocks.readLevelCheckPrompt.mockResolvedValue("check prompt")
    mocks.readLevelIteratePrompt.mockResolvedValue("iterate prompt")
    mocks.readLevelStartPrompt.mockResolvedValue("start prompt")
    mocks.readPrompt.mockResolvedValue("base prompt")
    mocks.readTaskData.mockResolvedValue(taskData)
    mocks.registerPromptForCurrentLevel.mockResolvedValue({ summary: progress, transition: null })
    mocks.resetTask.mockResolvedValue(undefined)
    mocks.runStructuredLlmRequest.mockResolvedValue(createLlmCall(JSON.stringify({
      component: "export default function Component() { return <div /> }",
      styles: "export {};",
    })))
    mocks.saveTaskCheckResult.mockResolvedValue(undefined)
    mocks.validateGeneratedFilesPayload.mockReturnValue(undefined)
    mocks.ensureUserTaskDir.mockResolvedValue(undefined)
    mocks.writeFile.mockResolvedValue(undefined)
  })

  it("saveTaskFiles сохраняет только разрешённые текстовые файлы через service boundary", async () => {
    const { saveTaskFiles } = await import("@/lib/task/actions")

    await expect(saveTaskFiles("task-a", [
      { fileId: "component", content: "export default function Component() {}" },
      { fileId: "unknown", content: "ignored" },
      { fileId: "reference", content: "ignored image" },
    ])).resolves.toEqual({ kind: "saved", written: 1 })

    expect(mocks.ensureUserTaskDir).toHaveBeenCalledWith("task-a")
    expect(mocks.writeFile).toHaveBeenCalledTimes(1)
    expect(mocks.writeFile).toHaveBeenCalledWith(
      "/user/tasks/task-a/Component.tsx",
      "export default function Component() {}",
      "utf-8",
    )
  })

  it("resetTaskRuntime сохраняет factory shape для HTTP response contract", async () => {
    const { resetTaskRuntime } = await import("@/lib/task/actions")

    await expect(resetTaskRuntime("task-a")).resolves.toMatchObject({
      kind: "reset",
      taskItem,
      taskData: {
        taskId: "task-a",
        contentByFileId: {},
        promptHistory: [],
        llmUsageSummary: {
          totalCalls: 0,
          teachingCostCents: 0,
          providersUsed: [],
          inputTokens: null,
          outputTokens: null,
          totalTokens: null,
          callsWithoutProviderMetrics: 0,
        },
        labContext,
      },
      started: false,
    })

    expect(mocks.resetTask).toHaveBeenCalledWith("task-a")
    expect(mocks.clearTaskCheckResult).toHaveBeenCalledWith("task-a")
  })

  it("startTaskLevel выполняет LLM-flow и возвращает прежний HTTP body через service boundary", async () => {
    mocks.isTaskStarted.mockResolvedValue(false)
    const { startTaskLevel } = await import("@/lib/task/actions")

    const result = await startTaskLevel("task-a")

    expect(result.status).toBeUndefined()
    expect(result.body).toMatchObject({ ok: true, taskData, taskItem: { id: "task-a" }, level })
    expect(mocks.runStructuredLlmRequest).toHaveBeenCalledWith(expect.objectContaining({
      target: "init",
      schemaName: "desengine_start_component_files",
      imageBase64List: [Buffer.from("image-bytes").toString("base64")],
    }))
    expect(mocks.markCurrentTaskLevelInitialized).toHaveBeenCalledWith("task-a")
  })

  it("iterateTaskLevel сохраняет изменения и prompt history на mock LLM без live credentials", async () => {
    const { iterateTaskLevel } = await import("@/lib/task/actions")

    const result = await iterateTaskLevel("task-a", "Сделай кнопку крупнее")

    expect(result.status).toBeUndefined()
    expect(result.body).toMatchObject({ ok: true, taskData, taskItem: { id: "task-a" }, transition: null })
    expect(mocks.appendPromptHistory).toHaveBeenCalledWith("task-a", expect.objectContaining({
      text: "Сделай кнопку крупнее",
      selectedFileNames: ["Component.tsx", "styles.ts"],
      changedFileIds: ["component"],
      teachingCostCents: 50,
      llmCall: expect.objectContaining({ provider: "openai", model: "mock-model" }),
    }))
    expect(mocks.registerPromptForCurrentLevel).toHaveBeenCalledWith("task-a")
  })

  it("checkTaskLevel сохраняет check-result на mock LLM без live credentials", async () => {
    mocks.runStructuredLlmRequest.mockResolvedValueOnce(createLlmCall(JSON.stringify({
      passed: true,
      message: "Уровень принят",
    })))
    const { checkTaskLevel } = await import("@/lib/task/actions")

    const result = await checkTaskLevel("task-a")

    expect(result.status).toBeUndefined()
    expect(result.body).toMatchObject({
      ok: true,
      taskItem: { id: "task-a", progress },
      checkResult: {
        taskId: "task-a",
        levelId: "level-1",
        passed: true,
        message: "Уровень принят",
        kind: "passed",
      },
      transition: null,
    })
    expect(mocks.passCurrentTaskLevelCheck).toHaveBeenCalledWith("task-a")
    expect(mocks.saveTaskCheckResult).toHaveBeenCalledWith(expect.objectContaining({
      taskId: "task-a",
      kind: "passed",
      message: "Уровень принят",
    }))
  })
})
