// @openSpec capability: project-manifest
// @openSpec scenarios:
// @openSpec  - "Пользователь экспортирует проект в manifest"
// @openSpec  - "Пользователь импортирует manifest в локальный проект"
// @openSpec capability: project-api
// @openSpec scenarios:
// @openSpec  - "Пользователь или внешняя автоматизация читает manifest через API"
// @openSpec capability: storage-adapter
// @openSpec scenarios:
// @openSpec  - "Runtime экспортирует manifest через adapter boundary"
// @openSpec  - "Runtime импортирует manifest через adapter boundary"
import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  createProjectManifestReadResponse,
  createProjectManifestWriteResponse,
} from "../../lib/project/api"
import {
  exportProjectManifest,
  parseProjectManifest,
  serializeProjectManifest,
} from "../../lib/project/manifest"
import { normalizeProject } from "../../lib/project/runtime"
import { createMemoryProjectStorage } from "../../lib/project/storage"
import { createProjectSession, createProjectWorkspaceActivity } from "../../lib/project/workspace-session"

function readRepoFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project manifest foundation", () => {
  it("строит внешний manifest как переносимый project contract", () => {
    const project = normalizeProject({
      id: "alpha-project",
      title: "Альфа",
      promptBrief: "Собрать первый проектный слой.",
      settings: {
        uiKitId: "ant",
      },
      createdAt: "2026-07-02T09:00:00.000Z",
      updatedAt: "2026-07-02T09:30:00.000Z",
    })

    const manifest = exportProjectManifest({
      project,
      components: [{
        id: "component-hero",
        projectId: project.id,
        title: "Hero",
        workflowKind: "image-to-component-workflow",
        status: "completed",
        createdAt: "2026-07-02T09:05:00.000Z",
        updatedAt: "2026-07-02T09:20:00.000Z",
      }],
      session: createProjectSession(project.id),
      activities: [createProjectWorkspaceActivity({
        projectId: project.id,
        kind: "project-component-created",
        componentId: "component-hero",
        componentTitle: "Hero",
        message: "Компонент добавлен в проект.",
      })],
    })

    expect(manifest).toMatchObject({
      kind: "desengine-project-manifest",
      version: "1",
      metadata: {
        code: "alpha-project",
        title: "Альфа",
        uiKitId: "ant",
      },
      project: {
        id: "alpha-project",
        title: "Альфа",
        settings: {
          uiKitId: "ant",
          workflowTemplateId: "project-design-workflow",
          promptBrief: "Собрать первый проектный слой.",
        },
      },
      workflowTemplate: {
        id: "project-design-workflow",
      },
      artifactsSummary: {
        componentCount: 1,
        completedComponentCount: 1,
        activityCount: 1,
      },
      promptBrief: "Собрать первый проектный слой.",
    })
  })

  it("сериализует и разбирает manifest без утечки внутренних storage keys", () => {
    const serialized = serializeProjectManifest({
      project: {
        id: "beta-project",
        title: "Бета",
        promptBrief: "Подготовить reusable project package.",
        settings: {
          uiKitId: "ant",
        },
      },
      components: [],
      promptBrief: "Подготовить reusable project package.",
    })

    const parsed = parseProjectManifest(serialized)

    expect(parsed.project.id).toBe("beta-project")
    expect(parsed.metadata.code).toBe("beta-project")
    expect(parsed.promptBrief).toBe("Подготовить reusable project package.")
    expect(serialized).not.toContain("desengine:project-workspaces")
  })

  it("держит import/export helper внутри project storage foundation", async () => {
    const storage = createMemoryProjectStorage([
      normalizeProject({
        id: "gamma-project",
        title: "Гамма",
        promptBrief: "Сделать импорт проекта наблюдаемым.",
        settings: {
          uiKitId: "ant",
        },
      }),
    ])

    const manifest = await storage.exportProjectManifest("gamma-project")
    expect(manifest?.project.id).toBe("gamma-project")

    const imported = await storage.importProjectManifest({
      ...manifest,
      project: {
        ...manifest?.project,
        title: "Гамма импортированная",
      },
      promptBrief: "Импортированное описание проекта.",
    })

    expect(imported.project.title).toBe("Гамма импортированная")
    expect(imported.promptBrief).toBe("Импортированное описание проекта.")
    await expect(storage.getActiveProjectId()).resolves.toBe("gamma-project")
  })

  it("публикует API foundation отдельно от project UI", () => {
    const readResponse = createProjectManifestReadResponse({
      project: normalizeProject({
        id: "delta-project",
        title: "Дельта",
        settings: {
          uiKitId: "ant",
        },
      }),
      components: [],
      activities: [],
      session: createProjectSession("delta-project"),
    })

    expect(readResponse.ok).toBe(true)
    expect(readResponse.manifest.project.id).toBe("delta-project")

    const writeResponse = createProjectManifestWriteResponse(readResponse.manifest)
    expect(writeResponse.ok).toBe(true)
    expect(writeResponse.manifest.project.id).toBe("delta-project")

    const routeSource = readRepoFile("app", "api", "projects", "manifest", "route.ts")
    expect(routeSource).toContain('from "@/lib/project/api"')
    expect(routeSource).toContain("export async function POST")
    expect(routeSource).toContain("export async function PUT")
    expect(routeSource).not.toContain("components/desengine/project")
  })
})
