// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает workflow проекта"
// @openSpec  - "Страница проекта выделяет один главный следующий шаг"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Пользователь видит project-owned workflow прямо на странице проекта"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import type { ProjectWorkflowReadoutSnapshot } from "../../lib/project/workflow-readout"
import { buildProjectWorkflowReadoutModel } from "../../components/desengine/project/projectSurface"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project workflow readout surface", () => {
  it("строит explainability-friendly model для project-first workflow snapshot", () => {
    const snapshot: ProjectWorkflowReadoutSnapshot = {
      projectId: "project-a",
      sessionStatus: "in_progress",
      currentStageId: "component-delivery",
      currentStageTitle: "Довести компонент «Hero card»",
      lastActivityAt: "2026-06-17T10:15:00.000Z",
      lastActivityLabel: "2026-06-17 10:15 UTC",
      stages: [
        {
          id: "project-structure",
          title: "Собрать состав проекта",
          description: "Проект получает набор компонентов, с которыми реально можно работать дальше.",
          status: "completed",
        },
        {
          id: "component-delivery",
          title: "Довести компонент «Hero card»",
          description: "Компонент остаётся частью проектной работы, а не отдельной задачей.",
          status: "in_progress",
        },
      ],
      entries: [
        {
          projectId: "project-a",
          componentId: "hero-card",
          componentTitle: "Hero card",
          componentStatus: "in_progress",
          isFocused: true,
          stageTitle: "Проект сейчас работает через этот компонент",
          stageStatus: "in_progress",
          lastActivityAt: "2026-06-17T10:15:00.000Z",
          notes: [
            "Компонент удерживает текущий фокус проектной работы.",
            "Следующий пользовательский шаг должен быть виден именно на странице проекта.",
          ],
        },
      ],
    }

    const model = buildProjectWorkflowReadoutModel(snapshot)

    expect(model.summary).toMatchObject({
      componentCountLabel: "1 компонент",
      focusedCountLabel: "1 фокус",
      completedCountLabel: "0 готовых компонентов",
      stageCountLabel: "2 шага workflow",
    })
    expect(model.entries[0]).toMatchObject({
      componentStatusLabel: "В активной работе проекта",
      focusLabel: "Текущий фокус проекта",
      stageStatusLabel: "Шаг в работе",
      stageTitle: "Проект сейчас работает через этот компонент",
    })
    expect(model.entries[0]?.lastActivityLabel).toBe("2026-06-17 10:15 UTC")
    expect(model.entries[0]?.noteLabels).toContain("Компонент удерживает текущий фокус проектной работы.")
  })

  it("подключает workflow readout к project page как отдельный пользовательский слой", () => {
    const projectPage = readProjectFile("app", "projects", "[projectId]", "page.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const productSurfaces = readProjectFile("components", "desengine", "project", "ProjectProductSurfacesPanel.tsx")
    const productSurfaceModel = readProjectFile("components", "desengine", "project", "projectProductSurface.ts")
    const projectSupportPanels = readProjectFile("components", "desengine", "project", "ProjectOverviewSupportPanels.tsx")
    const workflowPanel = readProjectFile("components", "desengine", "project", "ProjectWorkflowReadoutPanel.tsx")
    const workflowPanelContent = readProjectFile("components", "desengine", "project", "ProjectWorkflowReadoutContent.tsx")
    const workflowAdapter = readProjectFile("lib", "project", "workflow-readout.ts")
    const projectSpec = readProjectFile("openspec", "specs", "projects", "spec.md")
    const workflowSpec = readProjectFile("openspec", "specs", "workflow", "spec.md")

    expect(projectPage).not.toContain("readProjectWorkflowReadout")
    expect(projectPage).toContain("<ProjectOverviewScreen projectId={projectId} />")

    expect(projectOverview).toContain("ProjectOverviewSupportPanels")
    expect(projectOverview).toContain("ProjectProductSurfacesPanel")
    expect(projectSupportPanels).toContain("ProjectWorkflowReadoutPanel")
    expect(projectSupportPanels).toContain("workflowReadout={workflowReadout}")
    expect(productSurfaces).toContain("Workflow template и readout")
    expect(productSurfaceModel).toContain("buildProjectWorkflowTemplateModel")
    expect(productSurfaceModel).toContain('title: "Project design workflow"')

    expect(workflowPanel).toContain("Как проект держит рабочий контур")
    expect(workflowPanel).toContain("WorkflowReadoutContent")
    expect(workflowPanelContent).toContain("Компоненты")
    expect(workflowPanelContent).toContain("Фокусы")
    expect(workflowPanelContent).toContain("Последняя активность")
    expect(workflowPanelContent).toContain("Шаг workflow")

    expect(workflowAdapter).toContain("listProjectWorkflowStages")
    expect(workflowAdapter).toContain("componentId")
    expect(workflowAdapter).toContain("currentStageTitle")
    expect(workflowAdapter).toContain("lastActivityAt")

    expect(projectSpec).toContain("### Requirement: Проект показывает workflow как наблюдаемый слой")
    expect(projectSpec).toContain("#### Scenario: Страница проекта выделяет один главный следующий шаг")
    expect(workflowSpec).toContain("### Requirement: Project-aware workflow доступен для пользовательского readout")
  })
})
