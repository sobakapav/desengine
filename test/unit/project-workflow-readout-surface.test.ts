// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает workflow проекта"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Пользователь видит project-aware artifacts и bindings"
// @openSpec capability: workbench
// @openSpec scenarios:
// @openSpec  - "Runtime surface показывает definition и рабочую связку"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import type { ProjectWorkflowReadoutSnapshot } from "../../lib/project/workflow-readout"
import { buildProjectWorkflowReadoutModel } from "../../components/desengine/project/projectSurface"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project workflow readout surface", () => {
  it("строит explainability-friendly model для project-aware workflow/artifact snapshot", () => {
    const snapshot: ProjectWorkflowReadoutSnapshot = {
      projectId: "project-a",
      entries: [
        {
          projectId: "project-a",
          taskId: "intro-card",
          taskTitle: "intro-card",
          runStatus: "in_progress",
          workflowInstanceId: "workflow:intro-card:image-to-component",
          workflowStepId: "workflow-step:intro-card:image-to-component:run",
          workflowStepKind: "image-to-component-workflow",
          workflowStepTitle: "Работаем над workflow",
          workflowStepStatus: "in_progress",
          lastActivityAt: "2026-06-17T10:15:00.000Z",
          workflowPointCount: 5,
          completedWorkflowPointCount: 2,
          activeWorkflowPointTitle: "Storybook-сценарии",
          totalArtifactCount: 4,
          inputArtifactCount: 1,
          outputArtifactCount: 3,
          artifactKindSummary: [
            { kind: "code-file", count: 2 },
            { kind: "prompt-entry", count: 1 },
            { kind: "source-image", count: 1 },
          ],
          artifactPreview: ["Component.tsx", "styles.css", "Prompt history"],
          workflowPoints: [
            {
              stepId: "workflow-step:intro-card:image-to-component:ui-kit-component",
              kind: "ui-kit-component",
              title: "Базовый компонент из UI kit",
              status: "completed",
              outputArtifactCount: 1,
            },
            {
              stepId: "workflow-step:intro-card:image-to-component:storybook",
              kind: "storybook",
              title: "Storybook-сценарии",
              status: "in_progress",
              outputArtifactCount: 1,
            },
          ],
          workbenchInstanceId: "workbench:intro-card",
          workbenchDefinitionId: "lab-component-workbench",
          workbenchDefinitionTitle: "Lab workbench",
          workbenchProfileId: "level-lab",
        },
      ],
    }

    const model = buildProjectWorkflowReadoutModel(snapshot)

    expect(model.summary).toMatchObject({
      runCountLabel: "1 работа",
      workflowPointCountLabel: "5 шагов",
      artifactCountLabel: "4 результата",
      workbenchCountLabel: "1 рабочая поверхность",
    })
    expect(model.entries[0]).toMatchObject({
      runStatusLabel: "Работа в процессе",
      workflowStepStatusLabel: "Этап в работе",
      runProgressLabel: "Готово 2 из 5 шагов работы",
      activeWorkflowPointLabel: "Сейчас: Storybook-сценарии",
      artifactScopeLabel: "Входящих: 1, новых: 3",
      artifactKindsLabel: "файлы кода: 2, промпты: 1, исходные изображения: 1",
      artifactPreviewLabel: "Component.tsx, styles.css, Prompt history",
      workbenchLabel: "Lab workbench, id: workbench:intro-card",
    })
    expect(model.entries[0]?.workflowPointLabels).toContain("Storybook-сценарии (в работе, результатов: 1)")
    expect(model.entries[0]?.lastActivityLabel).toBe("2026-06-17 10:15 UTC")
    expect(model.entries[0]?.bindingLabel).toContain("Путь: проект -> задача -> этап")
  })

  it("подключает workflow readout к project page как отдельный пользовательский слой", () => {
    const projectPage = readProjectFile("app", "projects", "[projectId]", "page.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const workflowPanel = readProjectFile("components", "desengine", "project", "ProjectWorkflowReadoutPanel.tsx")
    const workflowAdapter = readProjectFile("lib", "project", "workflow-readout.ts")
    const projectSpec = readProjectFile("openspec", "specs", "projects", "spec.md")
    const workflowSpec = readProjectFile("openspec", "specs", "workflow", "spec.md")

    expect(projectPage).toContain("readProjectWorkflowReadout")
    expect(projectPage).toContain("workflowReadout={workflowReadout}")

    expect(projectOverview).toContain("ProjectWorkflowReadoutPanel")
    expect(projectOverview).toContain("workflowReadout={workflowReadout}")

    expect(workflowPanel).toContain("Как идёт работа по компонентам")
    expect(workflowPanel).toContain("Работы")
    expect(workflowPanel).toContain("Шаги работы")
    expect(workflowPanel).toContain("Последняя активность")
    expect(workflowPanel).toContain("Где идёт работа")

    expect(workflowAdapter).toContain("buildTaskWorkflowArtifactProjection")
    expect(workflowAdapter).toContain("resolveWorkflowStepTitle")
    expect(workflowAdapter).toContain("getTaskLabContext")
    expect(workflowAdapter).toContain("getWorkbenchDefinition")
    expect(workflowAdapter).toContain("workflowPointCount")
    expect(workflowAdapter).toContain("lastActivityAt")

    expect(projectSpec).toContain("### Requirement: Проект показывает workflow как наблюдаемый слой")
    expect(workflowSpec).toContain("### Requirement: Project-aware workflow доступен для пользовательского readout")
  })
})
