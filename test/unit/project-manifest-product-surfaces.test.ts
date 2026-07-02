// @openSpec capability: project-manifest
// @openSpec scenarios:
// @openSpec  - "Пользователь экспортирует проект в manifest"
// @openSpec  - "Пользователь импортирует manifest в локальный проект"
// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь экспортирует и импортирует manifest проекта"
// @openSpec  - "Пользователь открывает artifact library проекта"
// @openSpec  - "Пользователь читает prompt brief проекта"
// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Пользователь видит workflow template проекта"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  PROJECT_MANIFEST_VERSION,
  buildProjectManifestDocument,
} from "../../components/desengine/project/projectProductSurface"
import { normalizeProjectComponent } from "../../lib/project/component-runtime"
import { normalizeProject } from "../../lib/project/runtime"
import { buildProjectHistoryDiagnosticsSummary } from "../../lib/project/history-diagnostics"
import type { ProjectWorkflowReadoutSnapshot } from "../../lib/project/workflow-readout"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project manifest product surfaces", () => {
  it("строит переносимый manifest как product-facing контракт проекта", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Альфа",
      createdAt: "2026-07-02T09:00:00.000Z",
      updatedAt: "2026-07-02T10:00:00.000Z",
      settings: {
        uiKitId: "ant",
      },
    })
    const components = [
      normalizeProjectComponent({
        id: "component-hero",
        projectId: "project-a",
        title: "Hero card",
        status: "in_progress",
        workflowKind: "image-to-component-workflow",
        createdAt: "2026-07-02T09:10:00.000Z",
        updatedAt: "2026-07-02T10:10:00.000Z",
      }),
    ]
    const workflowReadout: ProjectWorkflowReadoutSnapshot = {
      projectId: "project-a",
      sessionStatus: "in_progress",
      currentStageId: "component-delivery",
      currentStageTitle: "Довести компонент «Hero card»",
      lastActivityAt: "2026-07-02T10:10:00.000Z",
      lastActivityLabel: "2026-07-02 10:10 UTC",
      stages: [
        {
          id: "project-structure",
          title: "Собрать состав проекта",
          description: "Проект получает набор компонентов, с которыми реально можно работать дальше.",
          status: "completed",
        },
      ],
      entries: [
        {
          projectId: "project-a",
          componentId: "component-hero",
          componentTitle: "Hero card",
          componentStatus: "in_progress",
          isFocused: true,
          stageTitle: "Проект сейчас работает через этот компонент",
          stageStatus: "in_progress",
          lastActivityAt: "2026-07-02T10:10:00.000Z",
          notes: ["Компонент удерживает текущий фокус проектной работы."],
        },
      ],
    }

    const manifest = buildProjectManifestDocument({
      components,
      historyDiagnostics: {
        projectId: "project-a",
        events: [],
        summary: buildProjectHistoryDiagnosticsSummary({
          activities: [],
          components,
        }),
      },
      project,
      promptBrief: "Собрать проект как согласованную систему.",
      session: null,
      workflowReadout,
    })

    expect(manifest.version).toBe(PROJECT_MANIFEST_VERSION)
    expect(manifest.project).toMatchObject({
      id: "project-a",
      title: "Альфа",
      settings: {
        uiKitId: "ant",
      },
    })
    expect(manifest.workflowTemplate.title).toBe("Project design workflow")
    expect(manifest.components[0]).toMatchObject({
      id: "component-hero",
      title: "Hero card",
      status: "in_progress",
    })
    expect(manifest.artifactsSummary.componentCount).toBe(1)
    expect(manifest.promptBrief).toContain("согласованную систему")
  })

  it("монтирует manifest, artifact library и prompt brief на project page", () => {
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const productSurfaces = readProjectFile("components", "desengine", "project", "ProjectProductSurfacesPanel.tsx")
    const productSurfaceModel = readProjectFile("components", "desengine", "project", "projectProductSurface.ts")

    expect(projectOverview).toContain("ProjectProductSurfacesPanel")
    expect(projectOverview).toContain("historyDiagnostics={workspace.historyDiagnostics}")

    expect(productSurfaces).toContain("Manifest и import-export")
    expect(productSurfaces).toContain("Artifact library")
    expect(productSurfaces).toContain("Prompt brief")
    expect(productSurfaces).toContain("Экспортировать manifest")
    expect(productSurfaces).toContain("Импортировать manifest")
    expect(productSurfaces).toContain("createBrowserProjectStorage")
    expect(productSurfaces).toContain("window.location.assign(getProjectUrl(imported.project.id))")

    expect(productSurfaceModel).toContain("PROJECT_MANIFEST_VERSION")
    expect(productSurfaceModel).toContain("buildProjectManifestDocument")
    expect(productSurfaceModel).toContain("buildProjectArtifactLibraryModel")
    expect(productSurfaceModel).toContain("buildProjectWorkflowTemplateModel")
    expect(productSurfaceModel).toContain("parseProjectManifest")
  })
})
