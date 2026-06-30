// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает task screen внутри активного проекта"
// @openSpec  - "Task runtime сохраняет active project при действиях пользователя"
// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Unit-проверка читает project-aware task client boundary"

import fs from "node:fs"
import path from "node:path"

import { afterEach, describe, expect, it, vi } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

const project = {
  id: "project-42",
  title: "Alpha",
  createdAt: "2026-06-10T10:00:00.000Z",
  updatedAt: "2026-06-10T10:00:00.000Z",
  settings: {
    uiKitId: "ant",
  },
} as const

describe("task project client boundary", () => {
  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
  })

  it("postPrompt отправляет iterate вместе с active project", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, taskData: { taskId: "task-a" }, resultKind: "applied", message: "ok" }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const { postPrompt } = await import("@/components/desengine/lab/Workbench/useWorkbenchPrompt")
    await postPrompt("task-a", "Сделай кнопку заметнее", project, "styles")

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/tasks/task-a/iterate",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ prompt: "Сделай кнопку заметнее", project, activeScreen: "styles" }),
      }),
    )
  })

  it("postFileUpdates отправляет save files вместе с active project", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, written: 1 }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const { postFileUpdates } = await import("@/components/desengine/lab/Workbench/useWorkbenchPersistence")
    await postFileUpdates("task-a", [{ fileId: "component", content: "export default function Component() { return null }" }], project)

    expect(fetchSpy).toHaveBeenCalledWith(
      "/api/tasks/task-a/files",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          updates: [{ fileId: "component", content: "export default function Component() { return null }" }],
          project,
        }),
      }),
    )
  })

  it("postTaskReset отправляет reset boundaries вместе с active project", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true, started: false }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const { postTaskReset } = await import("@/components/desengine/lab/Workbench/useWorkbenchTaskActions")

    await postTaskReset("task-a", project, "task")
    await postTaskReset("task-a", project, "level")

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "/api/tasks/task-a/reset",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ project }),
      }),
    )
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "/api/tasks/task-a/reset-level",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ project }),
      }),
    )
  })

  it("task open/start helpers держат active project в query и body", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    )

    const {
      buildTaskOpenUrl,
      postTaskStart,
      readProjectFromTaskUrl,
    } = await import("@/components/desengine/lab/task-client-boundary")

    expect(buildTaskOpenUrl("task-a", project)).toBe(
      "/api/tasks/task-a?projectId=project-42&projectTitle=Alpha&uiKitId=ant",
    )

    await postTaskStart("task-a", project, "stories")
    await postTaskStart("task-a", project)

    vi.stubGlobal("window", {
      location: {
        search: "?projectId=project-42&projectTitle=Alpha&uiKitId=ant",
      },
    })

    expect(readProjectFromTaskUrl("task-a")).toMatchObject({
      id: "project-42",
      title: "Alpha",
      settings: {
        uiKitId: "ant",
      },
    })

    expect(fetchSpy).toHaveBeenNthCalledWith(
      1,
      "/api/tasks/task-a/start",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ project, activeScreen: "stories" }),
      }),
    )
    expect(fetchSpy).toHaveBeenNthCalledWith(
      2,
      "/api/tasks/task-a/start",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ project, activeScreen: undefined }),
      }),
    )
  })

  it("source-контракты client surfaces читают active project вместо task-local fallback", () => {
    const screenSections = readProjectFile("components", "desengine", "lab", "LabScreen", "ScreenSections.tsx")
    const taskRoute = readProjectFile("components", "desengine", "lab", "TaskRoute", "TaskRoute.tsx")
    const labScreen = readProjectFile("components", "desengine", "lab", "LabScreen", "LabScreen.tsx")
    const clientBoundary = readProjectFile("components", "desengine", "lab", "task-client-boundary.ts")
    const sandpackRoute = readProjectFile("app", "api", "tasks", "[taskId]", "sandpack", "route.ts")
    const screenPage = readProjectFile("app", "lab", "[taskId]", "[screen]", "page.tsx")
    const persistence = readProjectFile("components", "desengine", "lab", "Workbench", "useWorkbenchPersistence.ts")
    const controller = readProjectFile("components", "desengine", "lab", "Workbench", "useWorkbenchController.ts")
    const labContainer = readProjectFile("components", "desengine", "lab", "LabScreen", "LabScreen.tsx")
    const taskRouteRuntime = readProjectFile("components", "desengine", "lab", "TaskRoute", "TaskRoute.tsx")
    expect(screenSections).toContain("storage.getActiveProjectId()")
    expect(screenSections).not.toContain("storage.getProject(`task-${taskId}`)")

    expect(taskRoute).toContain("postTaskStart")
    expect(taskRoute).toContain("readProjectFromTaskUrl")
    expect(taskRoute).toContain("storage.getActiveProjectId()")

    expect(labScreen).toContain("buildTaskOpenUrl")
    expect(labScreen).toContain("readProjectFromTaskUrl")
    expect(labScreen).toContain("storage.getActiveProjectId()")
    expect(clientBoundary).toContain("body: JSON.stringify({ project, activeScreen })")
    expect(sandpackRoute).toContain("resolveTaskRuntimeFilePath")
    expect(sandpackRoute).toContain("project.id")
    expect(screenPage).toContain("searchParams")
    expect(screenPage).toContain('const hasProjectContext = ["projectId", "projectTitle", "uiKitId"]')
    expect(screenPage).toContain("buildCurrentTaskScreenData({ taskId, taskItem, labContext, project })")
    expect(screenPage).toContain("redirect(createLabUrl(taskId, null, project))")
    expect(persistence).toContain("setPreviewVersion((current) => current + 1);")
    expect(controller).toContain("setPreviewVersion: projectState.setPreviewVersion")
    expect(screenSections).toContain("readProjectFromTaskUrl")
    expect(screenSections).toContain("getLabUrl(taskItem.id, null, readProjectFromTaskUrl(taskItem.id) ?? undefined)")
    expect(labContainer).toContain("router.push(getLabUrl(taskId, null, project));")
    expect(labContainer).toContain("const project = readProjectFromTaskUrl(transition.taskId) ?? undefined;")
    expect(taskRouteRuntime).toContain("getLabUrl(transition.taskId, null, readProjectFromTaskUrl(transition.taskId) ?? undefined)")
  })
})
