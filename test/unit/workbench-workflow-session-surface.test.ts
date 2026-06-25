// @openSpec capability: workbench
// @openSpec scenarios:
// @openSpec  - "Пользователь видит Workbench как workflow-session surface"
// @openSpec  - "Пользователь видит workflow points внутри Workbench"
// @openSpec  - "Preview подан как главный render-center workflow"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Runtime строит coordinator step для работы над workflow целиком"

import { describe, expect, it } from "vitest"

import { buildWorkbenchSurfaceSnapshot } from "../../components/desengine/lab/Workbench/workbenchSurface"
import type { ProjectWorkspace } from "../../lib/project/runtime"
import type { TaskData, TaskListItem } from "../../lib/task/types"

const project: ProjectWorkspace = {
  id: "project-42",
  title: "Проект 42",
  createdAt: "2026-05-20T10:00:00.000Z",
  updatedAt: "2026-05-20T10:05:00.000Z",
  settings: {
    uiKitId: "shadcn",
  },
  migration: {
    state: "idle",
    sourceUiKitId: "shadcn",
    targetUiKitId: "shadcn",
    invalidationScope: "none",
    requiresReplay: false,
    message: "",
    startedAt: null,
    finishedAt: null,
  },
}

const taskData: TaskData = {
  taskId: "intro-card",
  contentByFileId: {
    component: "export default function Component() { return <div /> }",
    styles: ".root { color: red; }",
  },
  promptHistory: [
    {
      text: "Сделай карточку плотнее",
      createdAt: "2026-05-20T10:10:00.000Z",
      iterationNumber: 1,
      levelNumber: 2,
      changedFileIds: ["component"],
    },
  ],
  llmUsageSummary: {
    totalCalls: 1,
    teachingCostCents: 15,
    providersUsed: ["mock"],
    inputTokens: null,
    outputTokens: null,
    totalTokens: null,
    callsWithoutProviderMetrics: 1,
  },
  labContext: {
    levelId: "level-2",
    levelNumber: 2,
    labId: "intro",
    commonExplanation: "Общее объяснение",
    taskTip: "Подсказка",
    taskCheckContract: "Контракт проверки",
    editableFileIds: ["component", "styles", "props"],
    images: [
      {
        id: "base",
        src: "/api/tasks/intro-card/image?imageId=base",
        width: 640,
        height: 480,
        show: true,
      },
    ],
  },
}

const taskItem: TaskListItem = {
  id: "intro-card",
  image: {
    width: 640,
    height: 480,
  },
  started: true,
  maxLevel: 3,
  progress: {
    currentLevel: 2,
    currentLevelId: "level-2",
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
  },
}

describe("workbench workflow session surface", () => {
  it("строит пользовательскую workflow-session модель из coordinator step и workflow points", () => {
    const surface = buildWorkbenchSurfaceSnapshot({
      project,
      taskData,
      taskItem,
      activeFileId: "styles",
    })

    expect(surface).toMatchObject({
      projectId: "project-42",
      taskId: "intro-card",
      workflowStepTitle: "Работаем над workflow",
      headline: "Работаем над workflow",
      sessionStatusLabel: "В работе",
      renderCenterTitle: "Главный рендер результата",
      selectedWorkflowPointId: "workflow-step:intro-card:image-to-component:styles",
      selectedWorkflowPointTitle: "Стилизация компонента",
    })

    expect(surface?.workflowPoints).toEqual([
      expect.objectContaining({
        title: "Базовый компонент из UI kit",
        statusLabel: "Готово",
        isSelectable: true,
        isFocus: false,
        isSelected: false,
      }),
      expect.objectContaining({
        title: "Стилизация компонента",
        statusLabel: "В работе",
        primaryFileId: "styles",
        isSelectable: true,
        isFocus: true,
        isSelected: true,
      }),
      expect.objectContaining({
        title: "Примеры доменных данных",
        statusLabel: "Ещё не проявлено",
        isSelectable: false,
      }),
      expect.objectContaining({
        title: "Props-контракт компонента",
        statusLabel: "Ещё не проявлено",
        primaryFileId: "props",
        isSelectable: true,
      }),
      expect.objectContaining({
        title: "Storybook-сценарии",
        statusLabel: "Готово",
        isSelectable: false,
      }),
    ])
  })

  it("определяет выбранный workflow-point по active file", () => {
    const surface = buildWorkbenchSurfaceSnapshot({
      project,
      taskData,
      taskItem,
      activeFileId: "component",
    })

    expect(surface?.selectedWorkflowPointTitle).toBe("Базовый компонент из UI kit")
    expect(surface?.workflowPoints.find((point) => point.title === "Базовый компонент из UI kit")).toMatchObject({
      isSelected: true,
      isFocus: true,
      primaryFileId: "component",
    })
  })
})
