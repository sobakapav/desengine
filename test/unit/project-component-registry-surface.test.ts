// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь создаёт новый проект из project registry"
// @openSpec  - "Пользователь видит список компонентов проекта"
// @openSpec  - "Пользователь создаёт компонент внутри проекта"
// @openSpec  - "Пользователь начинает работу над компонентом проекта"
// @openSpec  - "Компонент проекта сохраняет связь с backing task"
// @openSpec  - "Пользователь видит состояние workflow-сессии прямо в карточке компонента проекта"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает workflow из компонента проекта"
// @openSpec  - "Пользователь продолжает workflow компонента из страницы проекта"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  buildProjectComponentSurfaceModel,
  buildProjectSurfaceModel,
} from "../../components/desengine/project/projectSurface"
import { resolveProjectComponentTaskId } from "../../components/desengine/project/projectComponentWorkflow"
import { createMemoryProjectComponentStorage } from "../../lib/project/component-storage"
import { normalizeProjectComponent } from "../../lib/project/component-runtime"
import { normalizeProject } from "../../lib/project/runtime"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project component registry surface", () => {
  it("строит surface model для project component без locale-зависимого дрейфа", () => {
    const component = normalizeProjectComponent({
      id: "component-card",
      projectId: "project-a",
      title: "Product card",
      workflowKind: "image-to-component-workflow",
      status: "draft",
      createdAt: "2026-06-17T09:10:00.000Z",
      updatedAt: "2026-06-17T10:20:00.000Z",
    })

    expect(buildProjectComponentSurfaceModel(component)).toEqual({
      id: "component-card",
      title: "Product card",
      taskLabel: "ещё не назначен",
      workflowLabel: "Компонент по картинке",
      statusLabel: "Черновик",
      sessionStatusLabel: "Работа ещё не запускалась",
      sessionActionLabel: "Работать над компонентом",
      workflowProgressLabel: "Работа ещё не запускалась из этой карточки",
      activeWorkflowPointLabel: "Работа начнётся после первого запуска",
      lastActivityLabel: "Работа ещё не запускалась",
      createdAtLabel: "2026-06-17 09:10 UTC",
      updatedAtLabel: "2026-06-17 10:20 UTC",
    })
  })

  it("строит session-readout для компонента с уже проявленным workflow-run", () => {
    const component = normalizeProjectComponent({
      id: "component-card",
      projectId: "project-a",
      title: "Product card",
      taskId: "task-1",
      workflowKind: "image-to-component-workflow",
      status: "in_progress",
      createdAt: "2026-06-17T09:10:00.000Z",
      updatedAt: "2026-06-17T10:20:00.000Z",
    })

    expect(buildProjectComponentSurfaceModel(component, {
      taskLabel: "Task 1 (task-1)",
      workflowEntry: {
        projectId: "project-a",
        taskId: "task-1",
        taskTitle: "Task 1",
        runStatus: "in_progress",
        workflowInstanceId: "workflow-1",
        workflowStepId: "step-1",
        workflowStepKind: "coordinator",
        workflowStepTitle: "Работаем над workflow",
        workflowStepStatus: "in_progress",
        lastActivityAt: "2026-06-17T12:34:00.000Z",
        workflowPointCount: 4,
        completedWorkflowPointCount: 2,
        activeWorkflowPointTitle: "Создаём stories как UI-сценарии",
        totalArtifactCount: 3,
        inputArtifactCount: 1,
        outputArtifactCount: 2,
        artifactKindSummary: [],
        artifactPreview: [],
        workflowPoints: [],
        workbenchInstanceId: null,
        workbenchDefinitionId: null,
        workbenchDefinitionTitle: null,
        workbenchProfileId: null,
      },
    })).toMatchObject({
      taskLabel: "Task 1 (task-1)",
      sessionStatusLabel: "Работа в процессе",
      sessionActionLabel: "Продолжить работу",
      workflowProgressLabel: "Готово 2 из 4 шагов работы",
      activeWorkflowPointLabel: "Сейчас: Создаём stories как UI-сценарии",
      lastActivityLabel: "2026-06-17 12:34 UTC",
    })
  })

  it("назначает backing task компоненту без конфликта с уже занятыми слотами", () => {
    const components = [
      normalizeProjectComponent({
        id: "component-a",
        projectId: "project-a",
        title: "Card A",
        taskId: "task-occupied-locally",
      }),
      normalizeProjectComponent({
        id: "component-b",
        projectId: "project-a",
        title: "Card B",
      }),
    ]

    expect(resolveProjectComponentTaskId({
      component: components[1],
      components,
      occupiedTaskIds: ["task-occupied-globally"],
      workflowTaskCatalog: [
        { taskId: "task-occupied-globally", taskTitle: "Task 1" },
        { taskId: "task-occupied-locally", taskTitle: "Task 2" },
        { taskId: "task-free", taskTitle: "Task 3" },
      ],
    })).toBe("task-free")
  })

  it("переиспользует уже назначенный backing task для повторного входа в workflow", () => {
    const component = normalizeProjectComponent({
      id: "component-a",
      projectId: "project-a",
      title: "Card A",
      taskId: "task-stable",
    })

    expect(resolveProjectComponentTaskId({
      component,
      components: [component],
      occupiedTaskIds: ["task-stable", "task-other"],
      workflowTaskCatalog: [
        { taskId: "task-stable", taskTitle: "Task Stable" },
        { taskId: "task-other", taskTitle: "Task Other" },
      ],
    })).toBe("task-stable")
  })

  it("хранит project-scoped компоненты отдельно по projectId", async () => {
    const storage = createMemoryProjectComponentStorage()

    const alphaComponent = await storage.createComponent({
      projectId: "project-a",
      title: "Alpha card",
      workflowKind: "image-to-component-workflow",
    })

    await storage.createComponent({
      projectId: "project-b",
      title: "Beta card",
      workflowKind: "image-to-component-workflow",
    })

    expect((await storage.listComponents("project-a")).map((component) => component.title)).toEqual(["Alpha card"])
    expect(await storage.getComponent("project-a", alphaComponent.id)).toEqual(alphaComponent)
    expect(await storage.getComponent("project-a", "missing")).toBeNull()
  })

  it("подключает создание проектов и компонентов к project-facing surfaces", () => {
    const projectsScreen = readProjectFile("components", "desengine", "project", "ProjectsScreen.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const registryHook = readProjectFile("components", "desengine", "project", "useProjectRegistry.ts")
    const componentsHook = readProjectFile("components", "desengine", "project", "useProjectComponents.ts")
    const componentsPanel = readProjectFile("components", "desengine", "project", "ProjectComponentsPanel.tsx")

    expect(projectsScreen).toContain("Создать проект")
    expect(projectsScreen).toContain("Это первая точка входа в работу через проекты")
    expect(projectOverview).toContain("ProjectComponentsPanel")
    expect(registryHook).toContain("async function createProject")
    expect(registryHook).toContain("await storage.setActiveProjectId(project.id)")
    expect(componentsHook).toContain("createBrowserProjectComponentStorage")
    expect(componentsPanel).toContain("Создать компонент")
    expect(componentsPanel).toContain("image-to-component-workflow")
    expect(componentsPanel).toContain("Компоненты проекта")
    expect(componentsPanel).toContain("Всего компонентов")
    expect(componentsPanel).toContain("Компоненты помогают разложить проект на отдельные рабочие части")
    expect(componentsPanel).toContain("Работать над компонентом")
    expect(componentsPanel).toContain("Работать над новым компонентом")
    expect(componentsPanel).toContain("Продолжить работу")
    expect(componentsPanel).toContain("Последняя активность")
    expect(componentsPanel).toContain("workflowReadout")
    expect(componentsPanel).toContain("postTaskStart")
    expect(componentsPanel).toContain("getLabUrl")
    expect(componentsPanel).toContain("Открыть задачу")
    expect(componentsPanel).toContain("свободной рабочей задачи")
  })

  it("сохраняет совместимость overview project model с новым component layer", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Alpha",
      createdAt: "2026-06-17T09:10:00.000Z",
      updatedAt: "2026-06-17T10:20:00.000Z",
      settings: {
        uiKitId: "ant",
      },
    })

    expect(buildProjectSurfaceModel(project, false)).toMatchObject({
      id: "project-a",
      title: "Alpha",
      isActive: false,
      uiKitTitle: "Ant Design",
    })
  })
})
