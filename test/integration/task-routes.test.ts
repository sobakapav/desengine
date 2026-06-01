// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь сохраняет рабочие файлы"
// @openSpec  - "Пользователь сбрасывает задачу через service boundary"
// @openSpec  - "Пользователь запускает уровень через service boundary"
// @openSpec  - "Пользователь уточняет задачу через service boundary"
// @openSpec  - "Пользователь проверяет результат через service boundary"
// @openSpec  - "Route handlers используют переиспользуемые lab action services"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает уточняющий промпт"
// @openSpec  - "Провайдер вернул ошибку"
// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Integration-слой покрывает route handlers через fixture boundary"

import { beforeEach, describe, expect, it, vi } from "vitest"

import { createJsonRequest, readJsonResponse } from "./helpers/route-harness"

const mocks = vi.hoisted(() => ({
  buildCurrentTaskScreenData: vi.fn(),
  checkTaskLevel: vi.fn(),
  getLevelForTaskItem: vi.fn(),
  getTaskLabContext: vi.fn(),
  getTaskListItemById: vi.fn(),
  iterateTaskLevel: vi.fn(),
  normalizeProject: vi.fn(),
  requireAccessOrUnauthorizedResponse: vi.fn(),
  resetTaskRuntime: vi.fn(),
  saveTaskFiles: vi.fn(),
  startTaskLevel: vi.fn(),
}))

vi.mock("@/lib/auth/server", () => ({
  requireAccessOrUnauthorizedResponse: mocks.requireAccessOrUnauthorizedResponse,
}))

vi.mock("@/lib/task/actions", () => ({
  checkTaskLevel: mocks.checkTaskLevel,
  iterateTaskLevel: mocks.iterateTaskLevel,
  resetTaskRuntime: mocks.resetTaskRuntime,
  saveTaskFiles: mocks.saveTaskFiles,
  startTaskLevel: mocks.startTaskLevel,
}))

vi.mock("@/lib/project/runtime", () => ({
  normalizeProject: mocks.normalizeProject,
}))

vi.mock("@/lib/system/server", () => ({
  getLevelForTaskItem: mocks.getLevelForTaskItem,
  getTaskLabContext: mocks.getTaskLabContext,
  getTaskListItemById: mocks.getTaskListItemById,
}))

vi.mock("@/lib/task/task-screen-data", () => ({
  buildCurrentTaskScreenData: mocks.buildCurrentTaskScreenData,
}))

import { POST as postCheck } from "@/app/api/tasks/[taskId]/check/route"
import { POST as postFiles } from "@/app/api/tasks/[taskId]/files/route"
import { POST as postIterate } from "@/app/api/tasks/[taskId]/iterate/route"
import { POST as postReset } from "@/app/api/tasks/[taskId]/reset/route"
import { GET as getTask } from "@/app/api/tasks/[taskId]/route"
import { POST as postStart } from "@/app/api/tasks/[taskId]/start/route"

describe("task route integration wave", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAccessOrUnauthorizedResponse.mockResolvedValue(null)
    mocks.normalizeProject.mockImplementation((project: Record<string, unknown>) => ({
      uiKitId: "ant",
      uiMode: "ui-kit",
      ...project,
    }))
  })

  it("возвращает 401 из route guard до task runtime", async () => {
    mocks.requireAccessOrUnauthorizedResponse.mockResolvedValueOnce(
      Response.json({ ok: false, error: "Требуется авторизация" }, { status: 401 }),
    )

    const response = await postStart(
      new Request("http://localhost/api/tasks/task-1/start", { method: "POST" }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(response.status).toBe(401)
    expect(mocks.startTaskLevel).not.toHaveBeenCalled()
  })

  it("читает task screen через реальные route params и response mapping", async () => {
    const taskItem = { id: "task-1", started: true }
    const taskData = { taskId: "task-1", promptHistory: [] }
    const level = { id: "level-1" }
    const labContext = { levelId: "level-1" }

    mocks.getTaskListItemById.mockResolvedValue(taskItem)
    mocks.getTaskLabContext.mockResolvedValue(labContext)
    mocks.buildCurrentTaskScreenData.mockResolvedValue({ started: true, taskData })
    mocks.getLevelForTaskItem.mockResolvedValue(level)

    const response = await getTask(
      new Request("http://localhost/api/tasks/task-1"),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(response.status).toBe(200)
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: true,
      taskItem,
      started: true,
      taskData,
      level,
    })
  })

  it("отдаёт 404 для отсутствующей задачи", async () => {
    mocks.getTaskListItemById.mockResolvedValue(null)

    const response = await getTask(
      new Request("http://localhost/api/tasks/missing"),
      { params: Promise.resolve({ taskId: "missing" }) },
    )

    expect(response.status).toBe(404)
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: false,
      error: "Задание не найдено",
    })
  })

  it("маршрутизирует start в service boundary без ad-hoc логики", async () => {
    mocks.startTaskLevel.mockResolvedValue({
      status: 202,
      body: { ok: true, transition: "started" },
    })

    const response = await postStart(
      new Request("http://localhost/api/tasks/task-1/start", { method: "POST" }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(mocks.startTaskLevel).toHaveBeenCalledWith("task-1")
    expect(response.status).toBe(202)
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: true,
      transition: "started",
    })
  })

  it("отклоняет пустой iterate prompt до вызова runtime", async () => {
    const response = await postIterate(
      createJsonRequest({
        body: { prompt: "   " },
        method: "POST",
        url: "http://localhost/api/tasks/task-1/iterate",
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(response.status).toBe(400)
    expect(mocks.iterateTaskLevel).not.toHaveBeenCalled()
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: false,
      error: "Введите уточняющий промпт",
    })
  })

  it("trim-ит iterate prompt и пробрасывает результат runtime", async () => {
    mocks.iterateTaskLevel.mockResolvedValue({
      status: 200,
      body: { ok: true, resultKind: "applied" },
    })

    const response = await postIterate(
      createJsonRequest({
        body: { prompt: "  Сделай кнопку заметнее  " },
        method: "POST",
        url: "http://localhost/api/tasks/task-1/iterate",
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(mocks.iterateTaskLevel).toHaveBeenCalledWith("task-1", "Сделай кнопку заметнее")
    expect(response.status).toBe(200)
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: true,
      resultKind: "applied",
    })
  })

  it("нормализует project payload перед hidden check", async () => {
    mocks.checkTaskLevel.mockResolvedValue({
      status: 200,
      body: { ok: true, check: "passed" },
    })

    const response = await postCheck(
      createJsonRequest({
        body: { project: { uiKitId: "mui", uiMode: "ui-kit" } },
        method: "POST",
        url: "http://localhost/api/tasks/task-1/check",
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(mocks.normalizeProject).toHaveBeenCalledWith({
      uiKitId: "mui",
      uiMode: "ui-kit",
      id: "task-task-1",
      title: "Проект task-1",
    })
    expect(mocks.checkTaskLevel).toHaveBeenCalledWith("task-1", {
      uiKitId: "mui",
      uiMode: "ui-kit",
      id: "task-task-1",
      title: "Проект task-1",
    })
    expect(response.status).toBe(200)
  })

  it("маппит reset not_found в 404", async () => {
    mocks.resetTaskRuntime.mockResolvedValue({
      kind: "not_found",
      error: "Задание не найдено",
    })

    const response = await postReset(
      new Request("http://localhost/api/tasks/task-1/reset", { method: "POST" }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(response.status).toBe(404)
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: false,
      error: "Задание не найдено",
    })
  })

  it("маппит save files write_failed в 500 с деталями записи", async () => {
    mocks.saveTaskFiles.mockResolvedValue({
      kind: "write_failed",
      written: 1,
      errors: [{ fileId: "styles", error: "disk full" }],
    })

    const response = await postFiles(
      createJsonRequest({
        body: { updates: [{ fileId: "styles", content: "export {}" }] },
        method: "POST",
        url: "http://localhost/api/tasks/task-1/files",
      }),
      { params: Promise.resolve({ taskId: "task-1" }) },
    )

    expect(mocks.saveTaskFiles).toHaveBeenCalledWith("task-1", [
      { fileId: "styles", content: "export {}" },
    ])
    expect(response.status).toBe(500)
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: false,
      written: 1,
      errors: [{ fileId: "styles", error: "disk full" }],
    })
  })
})
