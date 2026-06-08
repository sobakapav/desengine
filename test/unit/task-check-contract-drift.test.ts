// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Система выполняет checking prompt lookup для уровня"
// @openSpec  - "Hidden check получает task-specific contract"
// @openSpec  - "Task-specific contract имеет приоритет над общим tip"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь проверяет результат через service boundary"
// @openSpec  - "Hidden check не требует элементы вне task contract"

import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { beforeEach, describe, expect, it, vi } from "vitest"

import type { LevelConfig } from "@/lib/level/types"
import type { TaskConfig } from "@/lib/task/types"

const checkActionMocks = vi.hoisted(() => ({
  clearTaskCheckResult: vi.fn(),
  failCurrentTaskLevelCheck: vi.fn(),
  getLevelEditableWorkbenchFiles: vi.fn(),
  getLevelForTaskItem: vi.fn(),
  getTaskLabContext: vi.fn(),
  getTaskListItemById: vi.fn(),
  isTaskStarted: vi.fn(),
  markCurrentTaskLevelCheckTechnicalError: vi.fn(),
  passCurrentTaskLevelCheck: vi.fn(),
  readLevelCheckPrompt: vi.fn(),
  readPrompt: vi.fn(),
  readTaskData: vi.fn(),
  runStructuredLlmRequest: vi.fn(),
  saveTaskCheckResult: vi.fn(),
}))

vi.mock("@/lib/lab/workbench", () => ({
  getLevelEditableWorkbenchFiles: checkActionMocks.getLevelEditableWorkbenchFiles,
}))

vi.mock("@/lib/llm/server", () => ({
  runStructuredLlmRequest: checkActionMocks.runStructuredLlmRequest,
}))

vi.mock("@/lib/onboarding/repository", () => ({
  isTaskStarted: checkActionMocks.isTaskStarted,
  readTaskData: checkActionMocks.readTaskData,
}))

vi.mock("@/lib/prompt/server", () => ({
  readLevelCheckPrompt: checkActionMocks.readLevelCheckPrompt,
  readPrompt: checkActionMocks.readPrompt,
}))

vi.mock("@/lib/task/actions/shared", async () => {
  const actual = await vi.importActual<typeof import("@/lib/task/actions/shared")>("@/lib/task/actions/shared")

  return {
    ...actual,
    taskActionShared: {
      ...actual.taskActionShared,
      readPromptImages: vi.fn().mockResolvedValue(["base64-image-base", "base64-image-variants"]),
    },
  }
})

vi.mock("@/lib/task/mutation-boundary", () => ({
  runTaskMutation: (_taskId: string, callback: () => Promise<unknown>) => callback(),
}))

vi.mock("@/lib/task/server", () => ({
  clearTaskCheckResult: checkActionMocks.clearTaskCheckResult,
  failCurrentTaskLevelCheck: checkActionMocks.failCurrentTaskLevelCheck,
  getLevelForTaskItem: checkActionMocks.getLevelForTaskItem,
  getTaskLabContext: checkActionMocks.getTaskLabContext,
  getTaskListItemById: checkActionMocks.getTaskListItemById,
  markCurrentTaskLevelCheckTechnicalError: checkActionMocks.markCurrentTaskLevelCheckTechnicalError,
  passCurrentTaskLevelCheck: checkActionMocks.passCurrentTaskLevelCheck,
  saveTaskCheckResult: checkActionMocks.saveTaskCheckResult,
}))

const level: LevelConfig = {
  id: "level-1",
  number: 1,
  title: "Первые состояния",
  description: "Описание уровня",
  layoutKey: "default",
  maxPromptsPerTask: 3,
  maxCheckAttempts: 2,
  labId: "level-1",
  images: [
    { id: "base", show: true },
    { id: "variants", show: true },
  ],
  editableFileIds: ["component"],
}

const taskConfig: TaskConfig = {
  image: { width: 17, height: 18 },
  base: { width: 17, height: 18 },
  variants: { width: 75, height: 87 },
  images: {
    base: { width: 17, height: 18 },
    variants: { width: 75, height: 87 },
  },
  maxLevel: 3,
}

async function createTaskLevelRoot(taskId = "otvinta-badge-counter") {
  const taskCatalogRoot = await mkdtemp(path.join(os.tmpdir(), "desengine-task-check-contract-"))
  const levelRoot = path.join(taskCatalogRoot, taskId, "levels", "level-1")
  await mkdir(levelRoot, { recursive: true })
  return { taskCatalogRoot, levelRoot }
}

function createLlmCall(outputText: string) {
  return {
    outputText,
    provider: "mock-provider",
    model: "mock-model",
    metrics: { status: "available", inputTokens: 1, outputTokens: 1, totalTokens: 2 },
  }
}

describe("task check contract drift", () => {
  describe("renderTaskCheckContract", () => {
    it("использует tracked override для otvinta-badge-counter без зависимости от onboarding-файлов", async () => {
      const { renderTaskCheckContract } = await import("@/lib/task/check-contract")
      const { taskCatalogRoot } = await createTaskLevelRoot()

      const contract = await renderTaskCheckContract({
        taskCatalogRoot,
        taskId: "otvinta-badge-counter",
        level,
        taskConfig,
      })

      expect(contract).toContain("Нельзя требовать колокольчик")
      expect(contract).toContain("Порядок основной причины провала")
    })

    it("рендерит tip.njk как fallback contract для задач без tracked override", async () => {
      const { renderTaskCheckContract } = await import("@/lib/task/check-contract")
      const { taskCatalogRoot, levelRoot } = await createTaskLevelRoot("task-without-override")
      await writeFile(
        path.join(levelRoot, "tip.njk"),
        "Контракт для {{ task.id }} / уровня {{ level.number }} / max {{ task.maxLevel }}",
        "utf-8",
      )

      await expect(renderTaskCheckContract({
        taskCatalogRoot,
        taskId: "task-without-override",
        level,
        taskConfig,
      })).resolves.toBe("Контракт для task-without-override / уровня 1 / max 3")
    })

    it("использует tip.md как fallback, если явного check-контракта нет", async () => {
      const { renderTaskCheckContract } = await import("@/lib/task/check-contract")
      const { taskCatalogRoot, levelRoot } = await createTaskLevelRoot("task-without-override")
      await writeFile(path.join(levelRoot, "tip.md"), "  Badge counter без колокольчика  \n", "utf-8")

      await expect(renderTaskCheckContract({
        taskCatalogRoot,
        taskId: "task-without-override",
        level,
        taskConfig,
      })).resolves.toBe("Badge counter без колокольчика")
    })
  })

  describe("taskCheckAction", () => {
    beforeEach(() => {
      vi.clearAllMocks()

      checkActionMocks.clearTaskCheckResult.mockResolvedValue(undefined)
      checkActionMocks.failCurrentTaskLevelCheck.mockResolvedValue({
        summary: {
          currentLevel: 1,
          currentLevelId: "level-1",
          currentLevelStatus: "in_progress",
          currentLevelDisplayStatus: "in_progress",
          currentLevelStarted: true,
          currentLevelNotStarted: false,
          promptsUsed: 0,
          promptsLimit: 3,
          promptsRemaining: 3,
          checkAttemptsUsed: 1,
          checkAttemptsLimit: 2,
          checkingState: "idle",
          maxLevel: 3,
          isCompleted: false,
          hasNextLevel: true,
        },
        attemptNumber: 1,
        maxCheckAttempts: 2,
        reset: false,
      })
      checkActionMocks.getLevelEditableWorkbenchFiles.mockReturnValue([
        { id: "component", fileName: "Component.tsx" },
      ])
      checkActionMocks.getLevelForTaskItem.mockResolvedValue(level)
      checkActionMocks.getTaskLabContext.mockResolvedValue({
        levelId: "level-1",
        levelNumber: 1,
        labId: "level-1",
        commonExplanation: "Общее объяснение",
        taskTip: "Счётчик должен быть круглым и вмещать числа от 0 до 99.",
        taskCheckContract: [
          "Обязательный элемент: круглый badge counter.",
          "Запрещено требовать колокольчик или любой другой отдельный icon-only элемент, которого нет на base.png и variants.png.",
          "Приоритет причины провала: 1) нет круглого счётчика, 2) счётчик не вмещает диапазон 0..99, 3) остальные замечания только если они прямо видны в контракте.",
        ].join("\n"),
        editableFileIds: ["component"],
        images: [
          { id: "base", src: "/api/tasks/otvinta-badge-counter/image?imageId=base", width: 17, height: 18, show: true },
          { id: "variants", src: "/api/tasks/otvinta-badge-counter/image?imageId=variants", width: 75, height: 87, show: true },
        ],
      })
      checkActionMocks.getTaskListItemById.mockResolvedValue({
        id: "otvinta-badge-counter",
        image: { width: 17, height: 18 },
        started: true,
        maxLevel: 3,
        progress: {
          currentLevel: 1,
          currentLevelId: "level-1",
          currentLevelStatus: "in_progress",
          currentLevelDisplayStatus: "in_progress",
          currentLevelStarted: true,
          currentLevelNotStarted: false,
          promptsUsed: 0,
          promptsLimit: 3,
          promptsRemaining: 3,
          checkAttemptsUsed: 0,
          checkAttemptsLimit: 2,
          checkingState: "idle",
          maxLevel: 3,
          isCompleted: false,
          hasNextLevel: true,
        },
      })
      checkActionMocks.isTaskStarted.mockResolvedValue(true)
      checkActionMocks.markCurrentTaskLevelCheckTechnicalError.mockResolvedValue({
        currentLevel: 1,
        currentLevelId: "level-1",
        currentLevelStatus: "in_progress",
        currentLevelDisplayStatus: "in_progress",
        currentLevelStarted: true,
        currentLevelNotStarted: false,
        promptsUsed: 0,
        promptsLimit: 3,
        promptsRemaining: 3,
        checkAttemptsUsed: 1,
        checkAttemptsLimit: 2,
        checkingState: "idle",
        maxLevel: 3,
        isCompleted: false,
        hasNextLevel: true,
      })
      checkActionMocks.passCurrentTaskLevelCheck.mockResolvedValue({
        summary: {},
        transition: null,
        attemptNumber: 1,
        maxCheckAttempts: 2,
      })
      checkActionMocks.readLevelCheckPrompt.mockResolvedValue("Промпт hidden check уровня")
      checkActionMocks.readPrompt.mockResolvedValue("Базовый prompt")
      checkActionMocks.readTaskData.mockResolvedValue({
        taskId: "otvinta-badge-counter",
        contentByFileId: {
          component: "export default function Component() { return <div /> }",
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
        labContext: null,
      })
      checkActionMocks.runStructuredLlmRequest.mockResolvedValue(createLlmCall(JSON.stringify({
        passed: false,
        message: "Нет круглого счётчика",
      })))
      checkActionMocks.saveTaskCheckResult.mockResolvedValue(undefined)
    })

    it("встраивает task-specific hidden check contract в instruction и запрещает домысливать лишние элементы", async () => {
      const { taskCheckAction } = await import("@/lib/task/actions/check")

      await taskCheckAction.checkTaskLevel("otvinta-badge-counter")

      expect(checkActionMocks.runStructuredLlmRequest).toHaveBeenCalledWith(expect.objectContaining({
        target: "check",
        instruction: expect.stringContaining("TASK-SPECIFIC HIDDEN CHECK CONTRACT"),
      }))

      const llmInput = checkActionMocks.runStructuredLlmRequest.mock.calls[0]?.[0]
      const instruction = String(llmInput?.instruction ?? "")

      expect(instruction).toContain("Запрещено требовать колокольчик")
      expect(instruction).toContain("Приоритет причины провала")
      expect(instruction).toContain("Если task-specific contract запрещает элемент, не считай его обязательным")
    })
  })
})
