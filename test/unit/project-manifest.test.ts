// @openSpec capability: project-manifest
// @openSpec scenarios:
// @openSpec  - "Пользователь экспортирует проект в manifest"
// @openSpec  - "Пользователь импортирует manifest в локальный проект"
// @openSpec  - "Пользователь смотрит на экспортируемый manifest"
// @openSpec capability: storage-adapter
// @openSpec scenarios:
// @openSpec  - "Runtime экспортирует manifest через adapter boundary"
// @openSpec  - "Runtime импортирует manifest через adapter boundary"

import { describe, expect, it } from "vitest"

import { normalizeProjectComponent } from "../../lib/project/component-runtime"
import {
  exportProjectManifest,
  importProjectManifest,
} from "../../lib/project/manifest"
import { createMemoryProjectStorage } from "../../lib/project/storage"
import { normalizeProject } from "../../lib/project/runtime"
import {
  createProjectSession,
  createProjectWorkspaceActivity,
} from "../../lib/project/workspace-session"

describe("project manifest", () => {
  it("экспортирует переносимый manifest с project-owned contract", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Alpha",
      settings: {
        promptBrief: "Собрать Hero и Card в одном стиле.",
        uiKitId: "ant",
      },
    })
    const component = normalizeProjectComponent({
      id: "hero-card",
      projectId: project.id,
      title: "Hero card",
      status: "in_progress",
      workflowKind: "image-to-component-workflow",
    })
    const session = createProjectSession(project.id)
    const activity = createProjectWorkspaceActivity({
      kind: "project-focus-set",
      message: "Проект переведён в фокус на компонент «Hero card».",
      projectId: project.id,
      componentId: component.id,
      componentTitle: component.title,
    })

    const manifest = exportProjectManifest({
      activities: [activity],
      components: [component],
      project,
      session,
    })

    expect(manifest.version).toBe("1")
    expect(manifest.project.id).toBe("project-a")
    expect(manifest.workflow.templateId).toBe("project-design-workflow")
    expect(manifest.workflow.promptBrief).toBe("Собрать Hero и Card в одном стиле.")
    expect(manifest.artifactSummary).toMatchObject({
      componentCount: 1,
      completedComponentCount: 0,
      eventCount: 1,
    })
  })

  it("импортирует manifest в canonical project state", () => {
    const manifest = importProjectManifest({
      version: "1",
      project: {
        id: "project-a",
        title: "Alpha",
        settings: {
          uiKitId: "mui",
        },
      },
      components: [
        {
          id: "hero-card",
          projectId: "wrong-id",
          title: "Hero card",
          status: "draft",
          workflowKind: "image-to-component-workflow",
          createdAt: "2026-07-02T10:00:00.000Z",
          updatedAt: "2026-07-02T10:00:00.000Z",
        },
      ],
      workflow: {
        promptBrief: "Собрать Hero section",
        templateId: "anything",
      },
    })

    expect(manifest.project.settings.workflowTemplateId).toBe("project-design-workflow")
    expect(manifest.project.settings.promptBrief).toBe("Собрать Hero section")
    expect(manifest.components[0]?.projectId).toBe("project-a")
    expect(manifest.workflow.promptBrief).toBe("Собрать Hero section")
  })

  it("storage import/export держит manifest как portable contract", async () => {
    const storage = createMemoryProjectStorage()
    const imported = await storage.importProjectManifest({
      project: {
        id: "project-a",
        title: "Alpha",
      },
      workflow: {
        promptBrief: "Собрать landing page",
      },
    })
    const exported = await storage.exportProjectManifest("project-a")

    expect(imported.project.id).toBe("project-a")
    expect(exported?.project.id).toBe("project-a")
    expect(exported?.workflow.promptBrief).toBe("Собрать landing page")
  })
})
