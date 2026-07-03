// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Страница проекта делает верстак прощупываемым без допуска к работе"
// @openSpec capability: workbench
// @openSpec scenarios:
// @openSpec  - "Workbench session принадлежит проекту, workflow и subject"
// @openSpec  - "Пользователь открывает workbench shell"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { getProjectWorkbenchUrl } from "../../lib/project/navigation"
import { normalizeProjectComponent } from "../../lib/project/component-runtime"
import { normalizeProject } from "../../lib/project/runtime"
import { buildProjectWorkbenchSessions } from "../../lib/project/workbench"
import { buildProjectWorkbenchSurfaceModel } from "../../components/desengine/project/projectWorkbenchSurface"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project workbench surface", () => {
  it("строит canonical route для project-aware workbench", () => {
    expect(getProjectWorkbenchUrl("project id", "component/a")).toBe(
      "/projects/project%20id/workbenches/component%2Fa",
    )
  })

  it("материализует project-aware workbench sessions из проекта и компонентов", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Альфа",
      settings: {
        uiKitId: "ant",
      },
    })
    const components = [
      normalizeProjectComponent({
        id: "component-hero",
        projectId: "project-a",
        title: "Hero",
        workflowKind: "image-to-component-workflow",
        status: "in_progress",
        updatedAt: "2026-07-03T10:15:00.000Z",
      }),
    ]

    const sessions = buildProjectWorkbenchSessions({
      components,
      project,
      session: {
        projectId: "project-a",
        workflowKind: "project-design-workflow",
        status: "in_progress",
        createdAt: "2026-07-03T10:00:00.000Z",
        updatedAt: "2026-07-03T10:15:00.000Z",
        lastActivityAt: "2026-07-03T10:15:00.000Z",
      },
      workflowReadout: {
        projectId: "project-a",
        sessionStatus: "in_progress",
        currentStageId: "component-delivery",
        currentStageTitle: "Довести компонент «Hero»",
        lastActivityAt: "2026-07-03T10:15:00.000Z",
        lastActivityLabel: "2026-07-03 10:15 UTC",
        stages: [],
        entries: [
          {
            projectId: "project-a",
            componentId: "component-hero",
            componentTitle: "Hero",
            componentStatus: "in_progress",
            stageTitle: "Компонент находится в активной работе проекта",
            stageStatus: "in_progress",
            lastActivityAt: "2026-07-03T10:15:00.000Z",
            notes: [],
          },
        ],
      },
    })

    expect(sessions.map((session) => session.subject.kind)).toEqual(["project", "component"])
    expect(sessions[0]).toMatchObject({
      definitionId: "project-workbench-shell",
      workflowDefinitionId: "project-design-workflow",
      status: "locked",
      subject: {
        kind: "project",
        id: "project-a",
      },
    })
    expect(sessions[1]).toMatchObject({
      definitionId: "project-workbench-shell",
      workflowDefinitionId: "image-to-component-workflow",
      status: "locked",
      subject: {
        kind: "component",
        id: "component-hero",
      },
    })
  })

  it("строит пользовательскую модель locked preview без legacy task-языка", () => {
    const model = buildProjectWorkbenchSurfaceModel("project-a", {
      id: "project-a--component--component-hero",
      definitionId: "project-workbench-shell",
      projectId: "project-a",
      projectTitle: "Альфа",
      workflowDefinitionId: "image-to-component-workflow",
      workflowTitle: "Компонент из изображения или Figma JSON",
      status: "locked",
      subject: {
        kind: "component",
        id: "component-hero",
        title: "Hero",
      },
      title: "Верстак компонента «Hero»",
      summary: "Этот верстак уже знает, что компонент находится в активной проектной работе.",
      lockReason: "Сначала стабилизируем project-level маршрут работы; затем откроем действия внутри верстака.",
      linkedComponentId: "component-hero",
      lastActivityAt: "2026-07-03T10:15:00.000Z",
    })

    expect(model).toMatchObject({
      title: "Верстак компонента «Hero»",
      statusLabel: "Materialized preview",
      subjectLabel: "Hero",
      workflowLabel: "Компонент из изображения или Figma JSON",
      linkageLabel: "Этот верстак связан с конкретным компонентом проекта",
      previewHref: "/projects/project-a/workbenches/project-a--component--component-hero",
    })
  })

  it("подключает workbench как новый project-facing слой", () => {
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const panel = readProjectFile("components", "desengine", "project", "ProjectWorkbenchPanel.tsx")
    const screen = readProjectFile("components", "desengine", "project", "ProjectWorkbenchScreen.tsx")
    const route = readProjectFile("app", "projects", "[projectId]", "workbenches", "[sessionId]", "page.tsx")
    const projectsSpec = readProjectFile("openspec", "specs", "projects", "spec.md")

    expect(projectOverview).toContain("ProjectWorkbenchPanel")
    expect(panel).toContain("Верстаки проекта")
    expect(panel).toContain("Открыть preview верстака")
    expect(panel).toContain("Materialized верстаки")
    expect(screen).toContain("режиме наблюдения")
    expect(screen).toContain("Работа пока не открыта")
    expect(route).toContain("getProjectWorkbenchUrl")
    expect(route).toContain("ProjectWorkbenchScreen")
    expect(projectsSpec).toContain("Страница проекта делает верстак прощупываемым без допуска к работе")
  })
})
