// @openSpec capability: task-model
// @openSpec scenarios:
// @openSpec  - "Текущая lab task проецируется в TaskInstance"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Runtime строит coordinator step для работы над workflow целиком"
// @openSpec  - "Runtime публикует catalog of workflow points для image-to-component задачи"
// @openSpec  - "Legacy level progress мапится в статусы workflow points без миграции storage"
// @openSpec capability: artifacts
// @openSpec scenarios:
// @openSpec  - "Рабочий файл становится code artifact"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Текущий runtime совместим с task-model projection"
// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Текущий lab level используется как legacy-bridge для workflow points"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import type { ProjectWorkspace } from "../../lib/project/runtime"
import { buildTaskWorkflowArtifactProjection, listImageComponentWorkflowPoints } from "../../lib/task/projection"
import type { TaskCheckResult, TaskData, TaskListItem } from "../../lib/task/types"

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

const checkResult: TaskCheckResult = {
  taskId: "intro-card",
  levelId: "level-2",
  levelNumber: 2,
  levelTitle: "Карточка",
  attemptNumber: 1,
  maxCheckAttempts: 2,
  passed: false,
  message: "Нужно поправить отступы",
  kind: "failed",
  createdAt: "2026-05-20T10:20:00.000Z",
}

const workbenchFiles = [
  {
    id: "component",
    fileName: "Component.tsx",
    title: "Компонент",
    edit: true,
  },
  {
    id: "styles",
    fileName: "styles.css",
    title: "Стили",
    edit: true,
  },
]

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("task workflow artifact projection", () => {
  it("строит TaskInstance с project scope из ProjectWorkspace без legacy project id", () => {
    const projection = buildTaskWorkflowArtifactProjection({
      taskData,
      project,
      taskItem,
      workbenchFiles,
      checkResult,
      title: "Intro card",
      createdAt: "2026-05-20T10:00:00.000Z",
    })

    expect(projection.task).toMatchObject({
      id: "intro-card",
      projectId: "project-42",
      taskType: "image-to-component-workflow",
      title: "Intro card",
      workflowInstanceId: "workflow:intro-card:image-to-component",
      status: "in_progress",
    })
    expect(projection.task.artifactIds).toEqual(projection.artifacts.map((artifact) => artifact.id))
    expect(projection.compatibility.legacyProjectIdFallback).toBe(false)
  })

  it("строит coordinator step и catalog of workflow points с artifact inputs и outputs", () => {
    const projection = buildTaskWorkflowArtifactProjection({
      taskData,
      projectId: project.id,
      taskItem,
      workbenchFiles,
      checkResult,
      createdAt: "2026-05-20T10:00:00.000Z",
    })

    expect(projection.workflow).toMatchObject({
      id: "workflow:intro-card:image-to-component",
      projectId: "project-42",
      taskId: "intro-card",
      definitionId: "workflow-definition:image-to-component",
      currentStepId: "workflow-step:intro-card:image-to-component:run",
    })
    expect(projection.workflow.stepInstances[0]).toEqual({
      id: "workflow-step:intro-card:image-to-component:run",
      projectId: "project-42",
      kind: "image-to-component-workflow",
      status: "failed",
      inputArtifactIds: ["artifact:intro-card:image:base"],
      outputArtifactIds: [
        "artifact:intro-card:file:component",
        "artifact:intro-card:file:styles",
        "artifact:intro-card:prompt:1",
        "artifact:intro-card:check-result:2",
      ],
      runtimeBindings: {
        workbenchInstanceIds: ["workbench:intro-card"],
        primaryWorkbenchInstanceId: "workbench:intro-card",
      },
    })
    expect(projection.workflow.stepInstances.slice(1)).toEqual([
      expect.objectContaining({
        id: "workflow-step:intro-card:image-to-component:ui-kit-component",
        kind: "ui-kit-component",
        status: "completed",
        outputArtifactIds: ["artifact:intro-card:file:component"],
      }),
      expect.objectContaining({
        id: "workflow-step:intro-card:image-to-component:styles",
        kind: "styles",
        status: "in_progress",
        outputArtifactIds: ["artifact:intro-card:file:styles"],
      }),
      expect.objectContaining({
        id: "workflow-step:intro-card:image-to-component:mock-data",
        kind: "mock-data",
        status: "not_started",
        outputArtifactIds: [],
      }),
      expect.objectContaining({
        id: "workflow-step:intro-card:image-to-component:props-contract",
        kind: "props-contract",
        status: "not_started",
        outputArtifactIds: [],
      }),
      expect.objectContaining({
        id: "workflow-step:intro-card:image-to-component:storybook",
        kind: "storybook",
        status: "completed",
        outputArtifactIds: [],
      }),
    ])
    expect(projection.workbenchInstances).toEqual([
      expect.objectContaining({
        id: "workbench:intro-card",
        definitionId: "lab-component-workbench",
        projectId: "project-42",
        taskId: "intro-card",
        workflowStepId: "workflow-step:intro-card:image-to-component:run",
        artifactBindings: expect.objectContaining({
          "code:component": "artifact:intro-card:file:component",
          "code:styles": "artifact:intro-card:file:styles",
          "source-image:artifact:intro-card:image:base": "artifact:intro-card:image:base",
        }),
      }),
    ])
  })

  it("публикует канонический каталог workflow points для image-to-component foundation", () => {
    expect(listImageComponentWorkflowPoints()).toEqual([
      {
        id: "ui-kit-component",
        kind: "ui-kit-component",
        title: "Базовый компонент из UI kit",
        legacyLevelHint: 1,
        fileIds: ["markup", "component"],
      },
      {
        id: "styles",
        kind: "styles",
        title: "Стилизация компонента",
        legacyLevelHint: 2,
        fileIds: ["styles"],
      },
      {
        id: "mock-data",
        kind: "mock-data",
        title: "Примеры доменных данных",
        legacyLevelHint: 3,
        fileIds: ["mock"],
      },
      {
        id: "props-contract",
        kind: "props-contract",
        title: "Props-контракт компонента",
        legacyLevelHint: 3,
        fileIds: ["props"],
      },
      {
        id: "storybook",
        kind: "storybook",
        title: "Storybook-сценарии",
        legacyLevelHint: 1,
        fileIds: ["stories"],
      },
    ])
  })

  it("проецирует artifacts из TaskData, prompt history и check-result без второго file-set", () => {
    const projection = buildTaskWorkflowArtifactProjection({
      taskData,
      project,
      taskItem,
      workbenchFiles,
      checkResult,
      createdAt: "2026-05-20T10:00:00.000Z",
    })

    expect(projection.artifacts).toHaveLength(5)
    expect(projection.artifacts.find((artifact) => artifact.id === "artifact:intro-card:file:component")).toMatchObject({
      projectId: "project-42",
      taskId: "intro-card",
      kind: "code-file",
      uri: "task-file://intro-card/Component.tsx",
      data: {
        fileId: "component",
        fileName: "Component.tsx",
        title: "Компонент",
        editable: true,
        content: taskData.contentByFileId.component,
      },
    })
    expect(projection.artifacts.find((artifact) => artifact.kind === "prompt-entry")).toMatchObject({
      id: "artifact:intro-card:prompt:1",
      createdAt: "2026-05-20T10:10:00.000Z",
      data: {
        text: "Сделай карточку плотнее",
        promptIndex: 1,
      },
    })
    expect(projection.artifacts.find((artifact) => artifact.kind === "check-result")).toMatchObject({
      id: "artifact:intro-card:check-result:2",
      createdAt: "2026-05-20T10:20:00.000Z",
      data: checkResult,
    })
  })

  it("требует явный project scope и оставляет legacy fallback compatibility-only", () => {
    expect(() => buildTaskWorkflowArtifactProjection({ taskData })).toThrow(
      "Task projection требует projectId или ProjectWorkspace",
    )

    const projection = buildTaskWorkflowArtifactProjection({
      taskData,
      allowLegacyProjectIdFallback: true,
    })

    expect(projection.task.projectId).toBe("task-intro-card")
    expect(projection.compatibility.legacyProjectIdFallback).toBe(true)
  })

  it("source-contract оставляет контракты отдельно от legacy task types и не добавляет storage migration", () => {
    const modelSource = readProjectFile("lib", "task", "model.ts")
    const projectionSource = readProjectFile("lib", "task", "projection.ts")
    const legacyTypesSource = readProjectFile("lib", "task", "types.ts")

    expect(modelSource).toContain("export type TaskInstance")
    expect(modelSource).toContain("export type WorkflowInstance")
    expect(modelSource).toContain("export type WorkflowStepInstance")
    expect(modelSource).toContain("projectId: string")
    expect(modelSource).toContain("runtimeBindings")
    expect(modelSource).toContain("export type Artifact")
    expect(projectionSource).toContain("buildTaskWorkflowArtifactProjection")
    expect(projectionSource).toContain("allowLegacyProjectIdFallback")
    expect(projectionSource).toContain("contentByFileId")
    expect(projectionSource).toContain("workbenchInstanceIds")
    expect(projectionSource).not.toContain("save")
    expect(projectionSource).not.toContain("write")
    expect(legacyTypesSource).not.toContain("type TaskInstance")
    expect(legacyTypesSource).not.toContain("type WorkflowInstance")
  })
})
