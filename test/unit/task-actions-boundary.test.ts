// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь редактирует один файл и переключается на другой"
// @openSpec  - "Лаборатория получает retriable overload-отказ task action runtime"
// @openSpec capability: user-progress
// @openSpec scenarios:
// @openSpec  - "Project UI kit migration переинициализирует только текущий уровень"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь сбрасывает задачу"
// @openSpec  - "Уточнение получает bounded overload-отказ"
// @openSpec  - "Проверка уровня получает bounded overload-отказ"
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Система выполняет start"
// @openSpec  - "Система выполняет iterate"
// @openSpec  - "Инициирующий запуск уровня превышает runtime payload budget"
// @openSpec  - "Iterate или check превышают runtime payload budget"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает уровень через service boundary"
// @openSpec  - "Пользователь уточняет задачу через service boundary"
// @openSpec  - "Пользователь проверяет результат через service boundary"
// @openSpec  - "Пользователь запускает project migration через service boundary"
// @openSpec  - "Task action runtime возвращает retriable overload-отказ"
// @openSpec  - "Runtime start/iterate/check возвращает structured diagnostics для speed/load путей"
// @openSpec  - "Runtime отклоняет oversized write-set до записи пользовательских файлов"
// @openSpec  - "Runtime boundary помечает очередь мутаций как degradation signal"
// @openSpec  - "Пользователь сохраняет рабочие файлы"
// @openSpec  - "Пользователь сбрасывает задачу через service boundary"
// @openSpec  - "Route handlers используют переиспользуемые lab action services"
// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Разработчик проверяет lab runtime после hardening"
// @openSpec  - "Проверка использует временное пользовательское состояние"
// @openSpec  - "Unit-проверка читает runtime diagnostics task action"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Инициирующий запуск уровня превышает runtime payload budget"
// @openSpec  - "Уточнение превышает runtime payload budget"
// @openSpec  - "Проверка уровня превышает runtime payload budget"

import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  configureTaskMutationBoundaryForTests,
  resetTaskMutationBoundaryForTests,
} from "@/lib/task/mutation-boundary"

const mocks = vi.hoisted(() => ({
  appendPromptHistory: vi.fn(),
  clearTaskCheckResult: vi.fn(),
  cleanupForbiddenWorkbenchFiles: vi.fn(),
  failCurrentTaskLevelCheck: vi.fn(),
  filterWorkbenchPayloadByAllowlist: vi.fn(),
  formatPromptHistoryTimestamp: vi.fn(),
  buildTaskMutationScopeKey: vi.fn(),
  getLevelEditableWorkbenchFileMap: vi.fn(),
  getLevelEditableWorkbenchFiles: vi.fn(),
  getLevelForTaskItem: vi.fn(),
  getScopedTaskRuntimeFilePath: vi.fn(),
  saveCurrentTaskLevelSnapshot: vi.fn(),
  getTaskLabContext: vi.fn(),
  getTaskListItemById: vi.fn(),
  getUserTaskFilePath: vi.fn(),
  invalidateCurrentTaskLevelForProjectMigration: vi.fn(),
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
  resetCurrentTaskLevel: vi.fn(),
  registerPromptForCurrentLevel: vi.fn(),
  resetTask: vi.fn(),
  runStructuredLlmRequest: vi.fn(),
  resolveTaskProject: vi.fn(),
  saveTaskCheckResult: vi.fn(),
  validateGeneratedFilesPayload: vi.fn(),
  writeFile: vi.fn(),
  ensureParentDir: vi.fn(),
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
  toLlmErrorResponse: (error: unknown) => {
    const errorKind = (
      typeof error === "object"
      && error !== null
      && "kind" in error
      && typeof error.kind === "string"
    )
      ? error.kind
      : undefined

    if (errorKind === "budget") {
      return {
        status: 413,
        body: {
          ok: false,
          error: error instanceof Error ? error.message : "Превышен runtime budget",
          errorKind,
        },
      }
    }

    return {
      status: 503,
      body: {
        ok: false,
        error: error instanceof Error ? error.message : "LLM недоступна",
        errorKind,
      },
    }
  },
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
  invalidateCurrentTaskLevelForProjectMigration: mocks.invalidateCurrentTaskLevelForProjectMigration,
  markCurrentTaskLevelCheckTechnicalError: mocks.markCurrentTaskLevelCheckTechnicalError,
  markCurrentTaskLevelInitialized: mocks.markCurrentTaskLevelInitialized,
  markTaskLevelInProgress: mocks.markTaskLevelInProgress,
  passCurrentTaskLevelCheck: mocks.passCurrentTaskLevelCheck,
  resetCurrentTaskLevel: mocks.resetCurrentTaskLevel,
  registerPromptForCurrentLevel: mocks.registerPromptForCurrentLevel,
  resetTask: mocks.resetTask,
  saveTaskCheckResult: mocks.saveTaskCheckResult,
}))

vi.mock("@/lib/task/level-reset-storage", () => ({
  saveCurrentTaskLevelSnapshot: mocks.saveCurrentTaskLevelSnapshot,
}))

vi.mock("@/lib/task/project-runtime-scope", () => ({
  buildTaskMutationScopeKey: mocks.buildTaskMutationScopeKey,
  getScopedTaskRuntimeFilePath: mocks.getScopedTaskRuntimeFilePath,
  resolveTaskProject: mocks.resolveTaskProject,
}))

vi.mock("@/lib/user/server", () => ({
  ensureParentDir: mocks.ensureParentDir,
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

function createDeferredValue<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((next) => {
    resolve = next
  })

  return { promise, resolve }
}

describe("task action service boundary", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetTaskMutationBoundaryForTests()

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
    mocks.buildTaskMutationScopeKey.mockImplementation((taskId: string, projectId: string) => `${taskId}::${projectId}`)
    mocks.getLevelEditableWorkbenchFileMap.mockReturnValue(new Map([
      ["component", "Component.tsx"],
      ["reference", "reference.png"],
    ]))
    mocks.getLevelEditableWorkbenchFiles.mockReturnValue(editableFiles)
    mocks.getLevelForTaskItem.mockResolvedValue(level)
    mocks.getTaskLabContext.mockResolvedValue(labContext)
    mocks.getTaskListItemById.mockResolvedValue(taskItem)
    mocks.getScopedTaskRuntimeFilePath.mockImplementation((taskId: string, projectId: string, fileName: string) => (
      `/user/tasks/${taskId}/.projects/${projectId}/${fileName}`
    ))
    mocks.getUserTaskFilePath.mockImplementation((taskId: string, fileName: string) => (
      `/user/tasks/${taskId}/${fileName}`
    ))
    mocks.invalidateCurrentTaskLevelForProjectMigration.mockResolvedValue(progress)
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
    mocks.resetCurrentTaskLevel.mockResolvedValue(progress)
    mocks.registerPromptForCurrentLevel.mockResolvedValue({ summary: progress, transition: null })
    mocks.resolveTaskProject.mockImplementation(async (taskId: string, project?: { id?: string }) => ({
      id: project?.id ?? `task-${taskId}`,
      title: "Проект",
      settings: { uiKitId: "shadcn" },
      migration: {
        state: "pending",
        sourceUiKitId: "shadcn",
        targetUiKitId: "ant",
        invalidationScope: "none",
        requiresReplay: false,
        message: "",
        startedAt: "2026-06-10T10:00:00.000Z",
        finishedAt: null,
      },
      createdAt: "2026-06-10T10:00:00.000Z",
      updatedAt: "2026-06-10T10:00:00.000Z",
    }))
    mocks.resetTask.mockResolvedValue(undefined)
    mocks.saveCurrentTaskLevelSnapshot.mockResolvedValue(undefined)
    mocks.runStructuredLlmRequest.mockResolvedValue(createLlmCall(JSON.stringify({
      component: "export default function Component() { return <div /> }",
      styles: "export {};",
    })))
    mocks.saveTaskCheckResult.mockResolvedValue(undefined)
    mocks.validateGeneratedFilesPayload.mockReturnValue(undefined)
    mocks.ensureParentDir.mockResolvedValue(undefined)
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

    expect(mocks.buildTaskMutationScopeKey).toHaveBeenCalledWith("task-a", "task-task-a")
    expect(mocks.writeFile).toHaveBeenCalledTimes(1)
    expect(mocks.writeFile).toHaveBeenCalledWith(
      "/user/tasks/task-a/.projects/task-task-a/Component.tsx",
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

    expect(mocks.resetTask).toHaveBeenCalledWith("task-a", expect.objectContaining({
      project: expect.objectContaining({ id: "task-task-a" }),
    }))
    expect(mocks.clearTaskCheckResult).toHaveBeenCalledWith("task-a")
  })

  it("resetCurrentTaskLevelRuntime возвращает отдельный contract без полного reset задачи", async () => {
    const { resetCurrentTaskLevelRuntime } = await import("@/lib/task/actions")

    await expect(resetCurrentTaskLevelRuntime("task-a")).resolves.toMatchObject({
      kind: "level_reset",
      taskItem: { id: "task-a", progress },
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
      started: true,
    })

    expect(mocks.resetCurrentTaskLevel).toHaveBeenCalledWith("task-a", expect.objectContaining({
      id: "task-task-a",
    }))
    expect(mocks.resetTask).not.toHaveBeenCalled()
    expect(mocks.clearTaskCheckResult).not.toHaveBeenCalled()
  })

  it("migrateProjectUiKitRuntime использует подтверждённый project scope и target", async () => {
    const { migrateProjectUiKitRuntime } = await import("@/lib/task/actions")
    const project = {
      id: "project-b",
      title: "Проект B",
      settings: { uiKitId: "shadcn" as const },
      migration: {
        state: "pending" as const,
        sourceUiKitId: "shadcn" as const,
        targetUiKitId: "ant" as const,
        invalidationScope: "none" as const,
        requiresReplay: false,
        message: "",
        startedAt: "2026-06-10T10:00:00.000Z",
        finishedAt: null,
      },
      createdAt: "2026-06-10T10:00:00.000Z",
      updatedAt: "2026-06-10T10:00:00.000Z",
    }
    const target = { uiKitId: "ant" as const as const }

    await expect(migrateProjectUiKitRuntime("task-a", project, target)).resolves.toMatchObject({
      kind: "project_migration",
      taskItem: { id: "task-a", progress },
      taskData,
      started: true,
      invalidationScope: "current-level",
    })

    expect(mocks.resolveTaskProject).toHaveBeenCalledWith("task-a", project)
    expect(mocks.buildTaskMutationScopeKey).toHaveBeenCalledWith("task-a", "project-b")
    expect(mocks.invalidateCurrentTaskLevelForProjectMigration).toHaveBeenCalledWith("task-a", expect.objectContaining({
      id: "project-b",
      migration: expect.objectContaining({
        targetUiKitId: "ant",
      }),
    }))
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
    expect(mocks.readTaskData).toHaveBeenCalledWith(taskItem, labContext, expect.objectContaining({
      id: "task-task-a",
    }))
    expect(result.body).toMatchObject({
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "start",
          stage: "task_start",
          status: "ok",
          taskId: "task-a",
        }),
        expect.objectContaining({
          path: "mutation_boundary",
          stage: "task_mutation",
          taskId: "task-a::task-task-a",
        }),
      ]),
    })
  })

  it("startTaskLevel возвращает bounded budget-ошибку до snapshot и provider-call", async () => {
    const { taskActionLlmBudgets } = await import("@/lib/task/actions/runtime-llm-budget")
    mocks.isTaskStarted.mockResolvedValue(false)
    mocks.readPrompt.mockImplementation(async (_variant: string, promptName: string) => (
      promptName === "start-component"
        ? "x".repeat(taskActionLlmBudgets.maxInstructionChars + 100)
        : "base prompt"
    ))
    const { startTaskLevel } = await import("@/lib/task/actions")

    const result = await startTaskLevel("task-a")

    expect(result.status).toBe(413)
    expect(result.body).toMatchObject({
      ok: false,
      errorKind: "budget",
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "start",
          stage: "task_start",
          status: "error",
          degradation: expect.objectContaining({
            reason: "runtime_budget_exceeded",
            details: expect.objectContaining({
              phase: "input",
              dimension: "instruction_chars",
            }),
          }),
        }),
      ]),
    })
    expect(mocks.saveCurrentTaskLevelSnapshot).not.toHaveBeenCalled()
    expect(mocks.runStructuredLlmRequest).not.toHaveBeenCalled()
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
    }), expect.objectContaining({ id: "task-task-a" }))
    expect(mocks.registerPromptForCurrentLevel).toHaveBeenCalledWith("task-a")
    expect(result.body).toMatchObject({
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "iterate",
          stage: "task_iterate",
          status: "ok",
          taskId: "task-a",
          size: expect.objectContaining({
            promptTextChars: "Сделай кнопку крупнее".length,
            changedFileCount: 1,
          }),
        }),
        expect.objectContaining({
          path: "mutation_boundary",
          stage: "task_mutation",
          taskId: "task-a::task-task-a",
        }),
      ]),
    })
  })

  it("iterateTaskLevel ограничивает primary file set выбранным workflow-пунктом", async () => {
    const { iterateTaskLevel } = await import("@/lib/task/actions")

    await iterateTaskLevel("task-a", "Доведи стили", undefined, "styles")

    expect(mocks.runStructuredLlmRequest).toHaveBeenCalledWith(expect.objectContaining({
      target: "iterate",
      schema: expect.objectContaining({
        required: ["styles"],
        properties: {
          styles: { type: ["string", "null"] },
        },
      }),
    }))
    expect(mocks.appendPromptHistory).toHaveBeenCalledWith("task-a", expect.objectContaining({
      selectedFileNames: ["styles.ts"],
    }), expect.anything())
  })

  it("startTaskLevel ограничивает initiator generation выбранным workflow-пунктом", async () => {
    mocks.isTaskStarted.mockResolvedValue(false)
    const { startTaskLevel } = await import("@/lib/task/actions")

    await startTaskLevel("task-a", undefined, "styles")

    expect(mocks.runStructuredLlmRequest).toHaveBeenCalledWith(expect.objectContaining({
      target: "init",
      schema: expect.objectContaining({
        required: ["styles"],
        properties: {
          styles: { type: "string" },
        },
      }),
    }))
  })

  it("iterateTaskLevel отклоняет oversized write-set до записи файлов и prompt history", async () => {
    const { taskActionLlmBudgets } = await import("@/lib/task/actions/runtime-llm-budget")
    mocks.runStructuredLlmRequest.mockResolvedValueOnce(createLlmCall(JSON.stringify({
      component: "x".repeat(taskActionLlmBudgets.maxWriteSetBytes + 512),
      styles: null,
    })))
    const { iterateTaskLevel } = await import("@/lib/task/actions")

    const result = await iterateTaskLevel("task-a", "Сделай кнопку крупнее")

    expect(result.status).toBe(413)
    expect(result.body).toMatchObject({
      ok: false,
      errorKind: "budget",
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "iterate",
          stage: "task_iterate",
          status: "error",
          degradation: expect.objectContaining({
            reason: "runtime_budget_exceeded",
            details: expect.objectContaining({
              phase: "write_set",
              dimension: "write_set_bytes",
            }),
          }),
        }),
      ]),
    })
    expect(mocks.writeFile).not.toHaveBeenCalled()
    expect(mocks.appendPromptHistory).not.toHaveBeenCalled()
    expect(mocks.registerPromptForCurrentLevel).not.toHaveBeenCalled()
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
    expect(mocks.readTaskData).toHaveBeenCalledWith(taskItem, labContext, expect.objectContaining({
      id: "task-task-a",
    }))
    expect(mocks.saveTaskCheckResult).toHaveBeenCalledWith(expect.objectContaining({
      taskId: "task-a",
      kind: "passed",
      message: "Уровень принят",
    }))
    expect(result.body).toMatchObject({
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "check",
          stage: "task_check",
          status: "ok",
          taskId: "task-a",
          load: expect.objectContaining({
            promptImageCount: 1,
            editableFileCount: 2,
          }),
        }),
        expect.objectContaining({
          path: "mutation_boundary",
          stage: "task_mutation",
          taskId: "task-a::task-task-a",
        }),
      ]),
    })
  })

  it("checkTaskLevel возвращает bounded budget-ошибку и не пишет technical check-result", async () => {
    const { taskActionLlmBudgets } = await import("@/lib/task/actions/runtime-llm-budget")
    mocks.getTaskLabContext.mockResolvedValue({
      ...labContext,
      images: Array.from({ length: taskActionLlmBudgets.maxPromptImageCount + 1 }, (_, index) => ({
        id: `target-${index}`,
        src: `/api/tasks/task-a/image?imageId=target-${index}`,
        width: 320,
        height: 240,
        show: true,
      })),
    })
    const { checkTaskLevel } = await import("@/lib/task/actions")

    const result = await checkTaskLevel("task-a")

    expect(result.status).toBe(413)
    expect(result.body).toMatchObject({
      ok: false,
      errorKind: "budget",
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "check",
          stage: "task_check",
          status: "error",
          degradation: expect.objectContaining({
            reason: "runtime_budget_exceeded",
            details: expect.objectContaining({
              phase: "input",
              dimension: "prompt_image_count",
            }),
          }),
        }),
      ]),
    })
    expect(mocks.runStructuredLlmRequest).not.toHaveBeenCalled()
    expect(mocks.markCurrentTaskLevelCheckTechnicalError).not.toHaveBeenCalled()
    expect(mocks.saveTaskCheckResult).not.toHaveBeenCalled()
  })

  it("startTaskLevel возвращает retriable overload-отказ до частичной мутации", async () => {
    configureTaskMutationBoundaryForTests({ maxQueuePerTask: 0 })
    mocks.isTaskStarted.mockResolvedValue(false)
    const firstLlmCall = createDeferredValue<ReturnType<typeof createLlmCall>>()
    mocks.runStructuredLlmRequest.mockImplementationOnce(() => firstLlmCall.promise)

    const { startTaskLevel } = await import("@/lib/task/actions")

    const first = startTaskLevel("task-a")
    await Promise.resolve()

    const refused = await startTaskLevel("task-a")

    expect(refused.status).toBe(503)
    expect(refused.body).toMatchObject({
      ok: false,
      errorKind: "overload",
      retryable: true,
      retryAfterMs: 1000,
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "start",
          stage: "task_start",
          degradation: expect.objectContaining({
            reason: "mutation_boundary_overload",
          }),
        }),
        expect.objectContaining({
          path: "mutation_boundary",
          stage: "task_mutation_refused",
          degradation: expect.objectContaining({
            reason: "task_mutation_overload",
          }),
        }),
      ]),
    })

    firstLlmCall.resolve(createLlmCall(JSON.stringify({
      component: "export default function Component() { return <div /> }",
      styles: "export {};",
    })))
    await expect(first).resolves.toMatchObject({ body: { ok: true } })
    expect(mocks.runStructuredLlmRequest).toHaveBeenCalledTimes(1)
  })

  it("iterateTaskLevel возвращает retriable overload-отказ и не пишет prompt history второй попытки", async () => {
    configureTaskMutationBoundaryForTests({ maxQueuePerTask: 0 })
    const firstLlmCall = createDeferredValue<ReturnType<typeof createLlmCall>>()
    mocks.runStructuredLlmRequest.mockImplementationOnce(() => firstLlmCall.promise)

    const { iterateTaskLevel } = await import("@/lib/task/actions")

    const first = iterateTaskLevel("task-a", "Сделай кнопку крупнее")
    await Promise.resolve()

    const refused = await iterateTaskLevel("task-a", "Ещё вариант")

    expect(refused.status).toBe(503)
    expect(refused.body).toMatchObject({
      ok: false,
      errorKind: "overload",
      retryable: true,
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "iterate",
          stage: "task_iterate",
          degradation: expect.objectContaining({
            reason: "mutation_boundary_overload",
          }),
        }),
        expect.objectContaining({
          path: "mutation_boundary",
          stage: "task_mutation_refused",
        }),
      ]),
    })

    firstLlmCall.resolve(createLlmCall(JSON.stringify({
      component: "export default function Component() { return <section /> }",
      styles: "export {};",
    })))
    await expect(first).resolves.toMatchObject({ body: { ok: true } })
    expect(mocks.appendPromptHistory).toHaveBeenCalledTimes(1)
  })

  it("checkTaskLevel возвращает retriable overload-отказ и не пишет check-result второй попытки", async () => {
    configureTaskMutationBoundaryForTests({ maxQueuePerTask: 0 })
    const firstLlmCall = createDeferredValue<ReturnType<typeof createLlmCall>>()
    mocks.runStructuredLlmRequest.mockImplementationOnce(() => firstLlmCall.promise)

    const { checkTaskLevel } = await import("@/lib/task/actions")

    const first = checkTaskLevel("task-a")
    await Promise.resolve()

    const refused = await checkTaskLevel("task-a")

    expect(refused.status).toBe(503)
    expect(refused.body).toMatchObject({
      ok: false,
      errorKind: "overload",
      retryable: true,
      runtimeDiagnostics: expect.arrayContaining([
        expect.objectContaining({
          path: "check",
          stage: "task_check",
          degradation: expect.objectContaining({
            reason: "mutation_boundary_overload",
          }),
        }),
        expect.objectContaining({
          path: "mutation_boundary",
          stage: "task_mutation_refused",
        }),
      ]),
    })

    firstLlmCall.resolve(createLlmCall(JSON.stringify({
      passed: true,
      message: "Уровень принят",
    })))
    await expect(first).resolves.toMatchObject({ body: { ok: true } })
    expect(mocks.saveTaskCheckResult).toHaveBeenCalledTimes(1)
  })
})
