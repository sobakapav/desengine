// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Модель не изменила ни один рабочий файл"
// @openSpec  - "Все изменения отфильтрованы allowlist уровня"
// @openSpec capability: user-progress
// @openSpec scenarios:
// @openSpec  - "No-op итерация не расходует уточняющий промпт"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Service boundary возвращает явный no-op iterate результат"

import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  appendPromptHistory: vi.fn(),
  clearTaskCheckResult: vi.fn(),
  cleanupForbiddenWorkbenchFiles: vi.fn(),
  filterWorkbenchPayloadByAllowlist: vi.fn(),
  formatPromptHistoryTimestamp: vi.fn(),
  getLevelForTaskItem: vi.fn(),
  getTaskLabContext: vi.fn(),
  getTaskListItemById: vi.fn(),
  getUserTaskFilePath: vi.fn(),
  isTaskStarted: vi.fn(),
  readFile: vi.fn(),
  readLevelIteratePrompt: vi.fn(),
  readPrompt: vi.fn(),
  readTaskData: vi.fn(),
  registerPromptForCurrentLevel: vi.fn(),
  runStructuredLlmRequest: vi.fn(),
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
  getLevelEditableWorkbenchFiles: () => [
    { id: "component", fileName: "Component.tsx" },
    { id: "styles", fileName: "styles.ts" },
  ],
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
  readLevelIteratePrompt: mocks.readLevelIteratePrompt,
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
    taskCatalogRoot: "/catalog",
    taskImageFile: "image.png",
    taskWorkbenchFiles: [
      { id: "component", fileName: "Component.tsx" },
      { id: "styles", fileName: "styles.ts" },
      { id: "reference", fileName: "reference.png" },
    ],
  },
}))

vi.mock("@/lib/task/mutation-boundary", () => ({
  runTaskMutation: (_taskId: string, action: () => Promise<unknown>) => action(),
}))

vi.mock("@/lib/task/prompt-context", () => ({
  buildTaskRuntimePromptContext: (context: unknown) => context,
}))

vi.mock("@/lib/task/server", () => ({
  clearTaskCheckResult: mocks.clearTaskCheckResult,
  getLevelForTaskItem: mocks.getLevelForTaskItem,
  getTaskLabContext: mocks.getTaskLabContext,
  getTaskListItemById: mocks.getTaskListItemById,
  registerPromptForCurrentLevel: mocks.registerPromptForCurrentLevel,
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
  editableFileIds: ["component", "styles"],
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

describe("iterate no-op feedback contract", () => {
  beforeEach(() => {
    vi.clearAllMocks()

    mocks.appendPromptHistory.mockResolvedValue(undefined)
    mocks.clearTaskCheckResult.mockResolvedValue(undefined)
    mocks.cleanupForbiddenWorkbenchFiles.mockResolvedValue({ deletedFileIds: [], deletedFilePaths: [] })
    mocks.filterWorkbenchPayloadByAllowlist.mockImplementation((payload: Record<string, string | null>) => ({
      allowedEntries: Object.entries(payload).map(([fileId, content]) => ({
        fileId,
        fileName: fileId === "component" ? "Component.tsx" : "styles.ts",
        content,
      })),
      ignoredFileIds: [],
    }))
    mocks.formatPromptHistoryTimestamp.mockReturnValue("19.05.2026 21:00")
    mocks.getLevelForTaskItem.mockResolvedValue(level)
    mocks.getTaskLabContext.mockResolvedValue(labContext)
    mocks.getTaskListItemById.mockResolvedValue(taskItem)
    mocks.getUserTaskFilePath.mockImplementation((taskId: string, fileName: string) => (
      `/user/tasks/${taskId}/${fileName}`
    ))
    mocks.isTaskStarted.mockResolvedValue(true)
    mocks.readFile.mockResolvedValue(Buffer.from("image-bytes"))
    mocks.readLevelIteratePrompt.mockResolvedValue("iterate prompt")
    mocks.readPrompt.mockResolvedValue("base prompt")
    mocks.readTaskData.mockResolvedValue(taskData)
    mocks.registerPromptForCurrentLevel.mockResolvedValue({ summary: progress, transition: null })
    mocks.runStructuredLlmRequest.mockResolvedValue(createLlmCall(JSON.stringify({
      component: "export default function Component() { return <div /> }",
      styles: "export {};",
    })))
    mocks.validateGeneratedFilesPayload.mockReturnValue(undefined)
    mocks.ensureUserTaskDir.mockResolvedValue(undefined)
    mocks.writeFile.mockResolvedValue(undefined)
  })

  it("возвращает отдельный no-op результат и не тратит попытку, если LLM не изменила ни один файл", async () => {
    mocks.runStructuredLlmRequest.mockResolvedValueOnce(createLlmCall(JSON.stringify({
      component: taskData.contentByFileId.component,
      styles: taskData.contentByFileId.styles,
    })))

    const { iterateTaskLevel } = await import("@/lib/task/actions")
    const result = await iterateTaskLevel("task-a", "Сделай кнопку крупнее")

    expect(result.body).toMatchObject({
      ok: true,
      resultKind: "noop",
      noopReason: "unchanged_files",
      message: "Модель не изменила ни один рабочий файл. Уточните запрос и повторите попытку.",
      taskData,
      taskItem,
      transition: null,
    })
    expect(mocks.appendPromptHistory).not.toHaveBeenCalled()
    expect(mocks.registerPromptForCurrentLevel).not.toHaveBeenCalled()
    expect(mocks.clearTaskCheckResult).not.toHaveBeenCalled()
    expect(mocks.writeFile).not.toHaveBeenCalled()
  })

  it("помечает ответ как allowlist-filtered no-op, если все изменения отфильтрованы", async () => {
    mocks.filterWorkbenchPayloadByAllowlist.mockReturnValueOnce({
      allowedEntries: [],
      ignoredFileIds: ["styles"],
    })

    const { iterateTaskLevel } = await import("@/lib/task/actions")
    const result = await iterateTaskLevel("task-a", "Сделай кнопку крупнее")

    expect(result.body).toMatchObject({
      ok: true,
      resultKind: "noop",
      noopReason: "allowlist_filtered",
      message: "Изменения не применились: ответ модели затронул только недоступные для этого уровня файлы.",
    })
    expect(mocks.appendPromptHistory).not.toHaveBeenCalled()
    expect(mocks.registerPromptForCurrentLevel).not.toHaveBeenCalled()
  })

  it("разводит applied и noop feedback в workbench prompt controller", async () => {
    const { resolvePromptRunSuccessState } = await import("@/components/desengine/lab/Workbench/useWorkbenchPrompt")

    expect(resolvePromptRunSuccessState({
      ok: true,
      resultKind: "applied",
      message: "Уточнение применено",
    })).toEqual({
      clearPrompt: true,
      refreshPreview: true,
      status: "Уточнение применено",
    })

    expect(resolvePromptRunSuccessState({
      ok: true,
      resultKind: "noop",
      noopReason: "unchanged_files",
      message: "Модель не изменила ни один рабочий файл. Уточните запрос и повторите попытку.",
    })).toEqual({
      clearPrompt: false,
      refreshPreview: false,
      status: "Модель не изменила ни один рабочий файл. Уточните запрос и повторите попытку.",
    })
  })
})
