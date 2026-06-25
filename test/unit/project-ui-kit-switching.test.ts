// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Лаборатория создаёт локальный проект для preview"
// @openSpec  - "Лаборатория сохраняет локальные project settings при rehydration"
// @openSpec  - "Пользователь переключает UI kit проекта без перезагрузки страницы"
// @openSpec  - "Лаборатория показывает итог project migration"
// @openSpec  - "Лаборатория показывает диагностику несовместимости UI kit"
// @openSpec capability: storage-adapter
// @openSpec scenarios:
// @openSpec  - "Runtime читает активный проект"
// @openSpec  - "Storage backend ещё локальный"
// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь создаёт первый проект в MVP workspace"
// @openSpec  - "Настройки preview сохраняются в project settings"
// @openSpec  - "Пользователь меняет UI kit проекта из canonical списка"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Sandpack preview использует project.uiKitId"
// @openSpec  - "Preview показывает безопасный fallback при несовместимости проекта"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"
import {
  completeProjectUiKitMigration,
  createProjectWorkspace,
  createDefaultProject,
  failProjectUiKitMigration,
  getProjectMigrationTarget,
  getProjectStorageKey,
  normalizeProject,
  projectNeedsUiKitMigration,
  serializeProjectWorkspace,
  startProjectUiKitMigration,
} from "../../lib/project/runtime"
import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
  createBrowserProjectStorage,
  createMemoryProjectStorage,
  readBrowserStoredActiveProjectId,
  readBrowserStoredProject,
} from "../../lib/project/storage"

const utilsSource = `export function cn(...inputs: string[]) { return inputs.filter(Boolean).join(" ") }\n`

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

function createStorageMock(seed: Record<string, string> = {}): Storage {
  const state = new Map(Object.entries(seed))

  return {
    get length() {
      return state.size
    },
    clear() {
      state.clear()
    },
    getItem(key: string) {
      return state.get(key) ?? null
    },
    key(index: number) {
      return Array.from(state.keys())[index] ?? null
    },
    removeItem(key: string) {
      state.delete(key)
    },
    setItem(key: string, value: string) {
      state.set(key, value)
    },
  }
}

async function buildPayload(component: string, uiKitId = "none") {
  return buildSandpackPreviewPayload(
    {
      component,
      uiBadge: "export function Badge() { return null }\n",
      systemUtils: utilsSource,
    },
    {
      project: normalizeProject({
        id: "task-demo",
        title: "Demo",
        uiKitId,
      }),
    },
  )
}

describe("project ui kit contract", () => {
  it("держит canonical project shape только с uiKitId", () => {
    expect(createDefaultProject("task-a")).toMatchObject({
      id: "task-a",
      title: "Локальный проект",
      settings: {
        uiKitId: "shadcn",
      },
    })
    expect(normalizeProject({ id: " p ", title: " T ", uiKitId: "antd" })).toMatchObject({
      id: "p",
      title: "T",
      settings: {
        uiKitId: "ant",
      },
    })
    expect(getProjectStorageKey("task-a")).toBe("desengine:project:task-a")
    expect(createProjectWorkspace({ title: "Новый sandbox" })).toMatchObject({
      title: "Новый sandbox",
      settings: {
        uiKitId: "shadcn",
      },
    })
  })

  it("сериализует workspace и migration без лишнего runtime-режима", () => {
    const workspace = serializeProjectWorkspace({
      id: " project-1 ",
      title: " Workspace ",
      createdAt: "2026-05-20T10:00:00.000Z",
      updatedAt: "2026-05-20T10:05:00.000Z",
      settings: {
        uiKitId: "mui",
      },
    })

    expect(workspace).toEqual({
      id: "project-1",
      title: "Workspace",
      createdAt: "2026-05-20T10:00:00.000Z",
      updatedAt: "2026-05-20T10:05:00.000Z",
      settings: {
        uiKitId: "mui",
      },
      migration: {
        state: "idle",
        sourceUiKitId: "mui",
        targetUiKitId: "mui",
        invalidationScope: "none",
        requiresReplay: false,
        message: "",
        startedAt: null,
        finishedAt: null,
      },
    })
  })

  it("storage adapter сохраняет project registry без лишних mode-хвостов", async () => {
    const storage = createMemoryProjectStorage()
    const firstProject = await storage.createProject({ title: "Проект A" })
    const secondProject = await storage.createProject({
      title: "Проект B",
      settings: {
        uiKitId: "ant",
      },
    })

    await storage.setActiveProjectId(secondProject.id)

    await expect(storage.getActiveProjectId()).resolves.toBe(secondProject.id)
    await expect(storage.getActiveProject()).resolves.toMatchObject({
      id: secondProject.id,
      settings: { uiKitId: "ant" },
    })
    await expect(storage.listProjects()).resolves.toHaveLength(2)
    expect(firstProject.settings.uiKitId).toBe("shadcn")
  })

  it("browser storage сохраняет только canonical project settings и active project", async () => {
    const storageMock = createStorageMock()
    const storage = createBrowserProjectStorage({ storage: storageMock, taskId: "task-a" })

    const project = await storage.createProject({
      id: "project-a",
      title: "Alpha",
      settings: { uiKitId: "ant" },
    })

    await storage.saveProject(project)
    await storage.setActiveProjectId(project.id)

    expect(storageMock.getItem(PROJECT_REGISTRY_STORAGE_KEY)).toContain('"settings":{"uiKitId":"ant"}')
    expect(storageMock.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY)).toBe("project-a")
    expect(readBrowserStoredProject(storageMock, "project-a", "task-a")).toMatchObject({
      settings: { uiKitId: "ant" },
    })
    expect(readBrowserStoredActiveProjectId(storageMock, "task-a")).toBe("project-a")
  })

  it("migration contract сравнивает и завершает только uiKitId", () => {
    const project = normalizeProject({
      id: "project-a",
      title: "Alpha",
      settings: { uiKitId: "shadcn" },
    })
    const target = getProjectMigrationTarget("ant")

    expect(projectNeedsUiKitMigration(project, target)).toBe(true)

    const pending = startProjectUiKitMigration(project, target)
    expect(pending.migration).toMatchObject({
      state: "pending",
      sourceUiKitId: "shadcn",
      targetUiKitId: "ant",
    })

    const completed = completeProjectUiKitMigration(project, target, {
      invalidationScope: "current-level",
      message: "Migration завершена.",
      requiresReplay: true,
    })
    expect(completed.settings).toEqual({ uiKitId: "ant" })
    expect(completed.migration).toMatchObject({
      state: "completed",
      sourceUiKitId: "shadcn",
      targetUiKitId: "ant",
      requiresReplay: true,
    })

    const failed = failProjectUiKitMigration(project, target, "Migration сломалась.")
    expect(failed.migration).toMatchObject({
      state: "failed",
      sourceUiKitId: "shadcn",
      targetUiKitId: "ant",
      message: "Migration сломалась.",
    })
  })

  it("preview использует uiKitId и даёт incompatibility fallback без скрытого branch по режимам", async () => {
    const okPayload = await buildPayload(
      `import { Badge } from "@/components/ui/badge"; export default function Component() { return <Badge /> }`,
      "shadcn",
    )
    expect(okPayload.project.effectiveUiKitId).toBe("shadcn")
    expect(okPayload.project.compatibility.status).toBe("compatible")

    const incompatiblePayload = await buildPayload(
      `import { Badge } from "@/components/ui/badge"; export default function Component() { return <Badge /> }`,
      "ant",
    )
    expect(incompatiblePayload.project.effectiveUiKitId).toBe("ant")
    expect(incompatiblePayload.project.compatibility.status).toBe("incompatible")
  })

  it("source-contracts работают только с projectId, projectTitle и uiKitId", () => {
    const sandpackRoute = readProjectFile("app", "api", "tasks", "[taskId]", "sandpack", "route.ts")
    const hintRoute = readProjectFile("app", "api", "tasks", "[taskId]", "hint", "route.ts")
    const taskRoute = readProjectFile("app", "api", "tasks", "[taskId]", "route.ts")
    const taskBoundary = readProjectFile("components", "desengine", "lab", "task-client-boundary.ts")
    const workbenchProjectScope = readProjectFile("components", "desengine", "lab", "Workbench", "useWorkbenchProjectScope.ts")
    const outRender = readProjectFile("components", "desengine", "lab", "InOut", "OutRender", "OutRender.tsx")

    expect(sandpackRoute).toContain('searchParams.get("uiKitId")')
    expect(hintRoute).toContain('searchParams.get("uiKitId")')
    expect(taskRoute).toContain('searchParams.get("uiKitId")')
    expect(taskBoundary).toContain("uiKitId")
    expect(workbenchProjectScope).toContain("uiKitId")
    expect(outRender).toContain("uiKitId")
  })
})
