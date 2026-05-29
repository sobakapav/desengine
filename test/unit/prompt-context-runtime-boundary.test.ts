// @openSpec capability: prompt-context
// @openSpec scenarios:
// @openSpec  - "Iterate flow строит context через общий builder"
// @openSpec  - "Builder включает project/task/workflow/artifacts/workbench"
// @openSpec  - "Builder включает constraints и provider capabilities"
// @openSpec  - "Legacy prompt templates получают совместимый renderContext"
// @openSpec  - "Task hints templating использует PromptContext-compatible context"
// @openSpec  - "Prompt builder получает canonical input"
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Система выполняет start"
// @openSpec  - "Система выполняет iterate"
// @openSpec  - "Система выполняет checking prompt lookup для уровня"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает уточняющий промпт"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает уровень через service boundary"
// @openSpec  - "Пользователь уточняет задачу через service boundary"
// @openSpec  - "Пользователь проверяет результат через service boundary"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import type { LevelConfig } from "@/lib/level/types"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import { buildTaskRuntimePromptContext } from "@/lib/task/prompt-context"
import type { TaskData, TaskListItem } from "@/lib/task/types"

const project: ProjectWorkspace = {
  id: "project-runtime",
  title: "Runtime project",
  createdAt: "2026-05-20T10:00:00.000Z",
  updatedAt: "2026-05-20T10:05:00.000Z",
  settings: {
    uiKitId: "ant",
    uiMode: "ui-kit",
  },
}

const level: Pick<LevelConfig, "id" | "number" | "title" | "labId" | "editableFileIds"> = {
  id: "level-2",
  number: 2,
  title: "Карточка",
  labId: "intro",
  editableFileIds: ["component", "styles"],
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

const taskData: TaskData = {
  taskId: "intro-card",
  contentByFileId: {
    component: "export default function Component() { return <div /> }",
    styles: ".root { color: red; }",
  },
  promptHistory: [
    {
      text: "Сделай компактнее",
      createdAt: "2026-05-20T10:10:00.000Z",
      iterationNumber: 1,
      levelNumber: 2,
      changedFileIds: ["component"],
    },
  ],
  llmUsageSummary: {
    totalCalls: 1,
    teachingCostCents: 50,
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
    editableFileIds: ["component", "styles"],
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

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("PromptContext runtime boundary", () => {
  it("строит canonical context из project/task/workflow/artifacts/workbench/user text", () => {
    const context = buildTaskRuntimePromptContext({
      taskId: "intro-card",
      taskMaxLevel: 3,
      taskImages: taskData.labContext?.images ?? [],
      levelTaskTip: taskData.labContext?.taskTip,
      levelTaskCheckContract: taskData.labContext?.taskCheckContract,
      level,
      project,
      taskData,
      taskItem,
      workbenchFiles: [
        { id: "component", fileName: "Component.tsx", title: "Component", edit: true },
        { id: "styles", fileName: "styles.ts", title: "Styles", edit: true },
      ],
      userText: "Сделай кнопку крупнее",
      constraints: ["allowed-workbench-files-only"],
      providerCapabilities: ["vision", "structured-output"],
    })

    expect(context.project.id).toBe("project-runtime")
    expect(context.task).toMatchObject({
      id: "intro-card",
      projectId: "project-runtime",
      taskType: "level-lab",
    })
    expect(context.workflowStep).toMatchObject({
      id: "workflow-step:intro-card:level-lab:2",
      kind: "level-lab",
      status: "in_progress",
      workbenchInstanceId: "workbench:intro-card",
    })
    expect(context.artifacts.map((artifact) => artifact.kind)).toEqual([
      "code-file",
      "code-file",
      "prompt-entry",
      "source-image",
    ])
    expect(context.workbench).toMatchObject({
      id: "workbench:intro-card",
      projectId: "project-runtime",
      taskId: "intro-card",
    })
    expect(context.userText).toBe("Сделай кнопку крупнее")
    expect(context.constraints).toContain("allowed-workbench-files-only")
    expect(context.providerCapabilities).toEqual(["vision", "structured-output"])
    expect(context.renderContext.user?.designSystemName).toBe("Ant Design")
    expect(context.renderContext.task).toMatchObject({
      tip: "Подсказка",
      checkContract: "Контракт проверки",
    })
    expect(context.renderContext.level?.editableFileIds).toEqual(["component", "styles"])
  })

  it("закрепляет downstream contract для task-hints-templating и prompt-builder", () => {
    const promptTypes = readProjectFile("lib", "prompt", "types.ts")
    const hintsSource = readProjectFile("lib", "task", "hints.ts")

    expect(promptTypes).toContain("type PromptContextDownstreamConsumer")
    expect(promptTypes).toContain('"task-hints-templating"')
    expect(promptTypes).toContain('"prompt-builder"')
    expect(promptTypes).toContain("input: PromptContext")
    expect(hintsSource).toContain("buildTaskPromptContext")
  })

  it("start/iterate/check service flows вызывают общий PromptContext builder", () => {
    const startSource = readProjectFile("lib", "task", "actions", "start.ts")
    const startStageSource = readProjectFile("lib", "task", "actions", "start-stage.ts")
    const iterateSource = readProjectFile("lib", "task", "actions", "iterate.ts")
    const checkSource = readProjectFile("lib", "task", "actions", "check.ts")

    for (const source of [startStageSource, iterateSource, checkSource]) {
      expect(source).toContain("buildTaskRuntimePromptContext")
      expect(source).toContain("providerCapabilities")
      expect(source).toContain("constraints")
    }

    expect(startSource).toContain("buildStartLlmInput")
    expect(iterateSource).toContain("userText: args.promptText")
    expect(checkSource).toContain("promptContext.renderContext")
  })
})
