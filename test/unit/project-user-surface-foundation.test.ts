// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь видит вкладку проектов в верхнем меню"
// @openSpec  - "Пользователь открывает список проектов"
// @openSpec  - "Пользователь создаёт новый проект из project registry"
// @openSpec  - "Пользователь открывает страницу конкретного проекта"
// @openSpec  - "Страница проекта выделяет один главный следующий шаг"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { getProjectUrl, getProjectsRootUrl } from "../../lib/project/navigation"
import { buildProjectSurfaceModel, sortProjectsForSurface } from "../../components/desengine/project/projectSurface"
import { normalizeProject } from "../../lib/project/runtime"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project user surface foundation", () => {
  it("строит канонические routes для раздела проектов", () => {
    expect(getProjectsRootUrl()).toBe("/projects")
    expect(getProjectUrl("project id/42")).toBe("/projects/project%20id%2F42")
  })

  it("готовит overview model для project surface без locale-зависимого дрейфа", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Альфа",
      createdAt: "2026-06-11T09:10:00.000Z",
      updatedAt: "2026-06-11T10:20:00.000Z",
      settings: {
        uiKitId: "ant",
      },
    })

    expect(buildProjectSurfaceModel(project, true)).toEqual({
      id: "project-a",
      title: "Альфа",
      isActive: true,
      uiKitTitle: "Ant Design",
      storageLabel: "Локально в браузере",
      createdAtLabel: "2026-06-11 09:10 UTC",
      updatedAtLabel: "2026-06-11 10:20 UTC",
    })
  })

  it("сортирует реестр проектов с приоритетом active project и свежих изменений", () => {
    const olderProject = normalizeProject({
      id: "project-a",
      title: "Альфа",
      updatedAt: "2026-06-10T10:00:00.000Z",
    })
    const activeProject = normalizeProject({
      id: "project-b",
      title: "Бета",
      updatedAt: "2026-06-09T10:00:00.000Z",
    })
    const newerProject = normalizeProject({
      id: "project-c",
      title: "Гамма",
      updatedAt: "2026-06-11T10:00:00.000Z",
    })

    expect(
      sortProjectsForSurface([olderProject, activeProject, newerProject], "project-b").map((project) => project.id),
    ).toEqual(["project-b", "project-c", "project-a"])
  })

  it("подключает вкладку проектов и отдельные project pages к product shell", () => {
    const navigation = readProjectFile("components", "desengine", "system", "Navigation.tsx")
    const projectsPage = readProjectFile("app", "projects", "page.tsx")
    const projectPage = readProjectFile("app", "projects", "[projectId]", "page.tsx")
    const projectsScreen = readProjectFile("components", "desengine", "project", "ProjectsScreen.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const projectPrimaryFlow = readProjectFile("components", "desengine", "project", "ProjectOverviewPrimaryFlow.tsx")
    const projectSupportPanels = readProjectFile("components", "desengine", "project", "ProjectOverviewSupportPanels.tsx")
    const projectWorkspacePanel = readProjectFile("components", "desengine", "project", "ProjectWorkspacePanel.tsx")
    const projectRegistryHook = readProjectFile("components", "desengine", "project", "useProjectRegistry.ts")
    const projectOverviewHook = readProjectFile("components", "desengine", "project", "useProjectOverview.ts")

    expect(navigation).toContain('label: "проекты"')
    expect(navigation).toContain("getProjectsRootUrl()")

    expect(projectsPage).toContain('import { ProjectsScreen } from "@/components/desengine/project/ProjectsScreen"')
    expect(projectsPage).toContain("requireAccessOrRedirect(getProjectsRootUrl())")

    expect(projectPage).toContain('import { ProjectOverviewScreen } from "@/components/desengine/project/ProjectOverviewScreen"')
    expect(projectPage).toContain("const canonicalPath = getProjectUrl(projectId)")
    expect(projectPage).toContain("await requireAccessOrRedirect(canonicalPath)")

    expect(projectsScreen).toContain("useProjectRegistry")
    expect(projectsScreen).toContain("Активный проект")
    expect(projectsScreen).toContain("локально в браузере")
    expect(projectsScreen).toContain("Открыть проект")
    expect(projectsScreen).toContain("Следующий шаг")
    expect(projectOverview).not.toContain("ProjectArchitectureTransformPanel")
    expect(projectOverview).toContain("ProjectOverviewPrimaryFlow")
    expect(projectOverview).toContain("ProjectOverviewSupportPanels")
    expect(projectWorkspacePanel).toContain("Работа над проектом")
    expect(projectPrimaryFlow).toContain("Сейчас важно")
    expect(projectPrimaryFlow).toContain("Добавьте первый компонент")
    expect(projectPrimaryFlow).toContain("Сделать фокусом проекта")
    expect(projectSupportPanels).toContain("Поддерживающий слой проекта")
    expect(projectSupportPanels).toContain("Паспорт проекта")
    expect(projectSupportPanels).toContain("Идентификатор проекта")
    expect(projectRegistryHook).toContain("createBrowserProjectStorage")
    expect(projectOverviewHook).toContain("createBrowserProjectStorage")
  })
})
