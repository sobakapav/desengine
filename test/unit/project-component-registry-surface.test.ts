// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь создаёт новый проект из project registry"
// @openSpec  - "Пользователь видит список компонентов проекта"
// @openSpec  - "Пользователь создаёт компонент внутри проекта"
// @openSpec  - "Пользователь делает компонент текущим фокусом проекта"
// @openSpec  - "Компонент не открывает отдельную task-сессию"
// @openSpec  - "Пользователь видит положение компонента внутри project-workflow"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Пользователь переводит проектный workflow на конкретный компонент"
// @openSpec  - "Пользователь возвращает готовый компонент в активный workflow"

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
      workflowLabel: "Компонент внутри проектного workflow",
      statusLabel: "Ещё не включён в работу",
      sessionStatusLabel: "Компонент ещё не включён в активную работу проекта",
      sessionActionLabel: "Сделать фокусом проекта",
      workflowProgressLabel: "Проект ещё не выбрал этот компонент как явный фокус",
      activeWorkflowPointLabel: "Работа через этот компонент начнётся после выбора фокуса",
      lastActivityLabel: "Активность по компоненту ещё не зафиксирована",
      completeActionLabel: "Отметить как готовый",
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
      workflowEntry: {
        projectId: "project-a",
        componentId: "component-card",
        componentTitle: "Product card",
        componentStatus: "in_progress",
        isFocused: true,
        stageTitle: "Проект сейчас работает через этот компонент",
        stageStatus: "in_progress",
        lastActivityAt: "2026-06-17T12:34:00.000Z",
        notes: [],
      },
    })).toMatchObject({
      sessionStatusLabel: "Текущий фокус проекта",
      sessionActionLabel: "Текущий фокус проекта",
      workflowProgressLabel: "Проект сейчас работает через этот компонент",
      activeWorkflowPointLabel: "Сейчас проект работает через этот компонент",
      lastActivityLabel: "2026-06-17 12:34 UTC",
      completeActionLabel: "Отметить как готовый",
    })
  })

  it("использует внутренний workflow-template, если у компонента ещё нет legacy taskId", () => {
    const component = normalizeProjectComponent({
      id: "component-b",
      projectId: "project-a",
      title: "Card B",
    })

    expect(resolveProjectComponentTaskId({
      component,
      workflowTaskCatalog: [
        { taskId: "easy-buy-app-badge", taskTitle: "Task 1" },
        { taskId: "task-secondary", taskTitle: "Task 2" },
      ],
    })).toBe("component-workflow")
  })

  it("не подбирает runtime-task по projectId или title компонента", () => {
    const component = normalizeProjectComponent({
      id: "component-b",
      projectId: "ot-vinta-tab",
      title: "oncor-row",
    })

    expect(resolveProjectComponentTaskId({
      component,
      workflowTaskCatalog: [
        { taskId: "oncor-row", taskTitle: "oncor-row" },
        { taskId: "otvinta-tab", taskTitle: "otvinta-tab" },
        { taskId: "easy-buy-app-badge", taskTitle: "easy-buy-app-badge" },
      ],
    })).toBe("component-workflow")
  })

  it("переходит к каноническому workflow-template, если прямого совпадения нет", () => {
    const component = normalizeProjectComponent({
      id: "component-b",
      projectId: "project-a",
      title: "Card B",
    })

    expect(resolveProjectComponentTaskId({
      component,
      workflowTaskCatalog: [
        { taskId: "easy-buy-app-badge", taskTitle: "easy-buy-app-badge" },
        { taskId: "task-secondary", taskTitle: "Task 2" },
      ],
    })).toBe("component-workflow")
  })

  it("не наследует runtime-task другого компонента проекта", () => {
    const components = [
      normalizeProjectComponent({
        id: "component-a",
        projectId: "project-a",
        title: "Primary card",
        taskId: "dipole-button",
      }),
      normalizeProjectComponent({
        id: "component-b",
        projectId: "project-a",
        title: "Fresh card",
      }),
    ]

    expect(resolveProjectComponentTaskId({
      component: components[1],
      workflowTaskCatalog: [
        { taskId: "dipole-button", taskTitle: "dipole-button" },
        { taskId: "easy-buy-app-badge", taskTitle: "easy-buy-app-badge" },
      ],
    })).toBe("component-workflow")
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
    const projectWorkspacePanel = readProjectFile("components", "desengine", "project", "ProjectWorkspacePanel.tsx")
    const registryHook = readProjectFile("components", "desengine", "project", "useProjectRegistry.ts")
    const componentsHook = readProjectFile("components", "desengine", "project", "useProjectComponents.ts")
    const componentsPanel = readProjectFile("components", "desengine", "project", "ProjectComponentsPanel.tsx")
    const componentsPanelContent = readProjectFile("components", "desengine", "project", "ProjectComponentsPanelContent.tsx")

    expect(projectsScreen).toContain("Создать проект")
    expect(projectsScreen).toContain("Это первая точка входа в работу через проекты")
    expect(projectOverview).toContain("ProjectComponentsPanel")
    expect(registryHook).toContain("async function createProject")
    expect(registryHook).toContain("await storage.setActiveProjectId(project.id)")
    expect(componentsHook).toContain("createBrowserProjectComponentStorage")
    expect(componentsPanel).toContain("Добавить компонент")
    expect(componentsPanel).toContain("Компоненты проекта")
    expect(componentsPanel).toContain("ComponentCounters")
    expect(componentsPanel).toContain("Компоненты больше не запускают отдельные task-runtime")
    expect(componentsPanel).toContain("Всего компонентов")
    expect(componentsPanel).toContain("Теперь его можно сделать явным фокусом всей работы")
    expect(componentsPanelContent).toContain("Сделать фокусом проекта")
    expect(componentsPanelContent).toContain("Текущий фокус проекта")
    expect(componentsPanelContent).toContain("Последняя активность")
    expect(componentsPanelContent).not.toContain("Открыть задачу")
    expect(componentsPanelContent).toContain("completeActionLabel")
    expect(projectOverview).not.toContain("ProjectTaskBindings")
    expect(projectOverview).not.toContain("Открыть задачу")
    expect(projectWorkspacePanel).toContain("Работа над проектом")
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
