// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает страницу проекта и видит его задачи"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь видит проект задачи"
// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Integration-слой покрывает route handlers через fixture boundary"

import { beforeEach, describe, expect, it, vi } from "vitest"

import { readJsonResponse } from "./helpers/route-harness"

const mocks = vi.hoisted(() => ({
  listTaskProjectBindings: vi.fn(),
  requireAccessOrUnauthorizedResponse: vi.fn(),
}))

vi.mock("@/lib/auth/server", () => ({
  requireAccessOrUnauthorizedResponse: mocks.requireAccessOrUnauthorizedResponse,
}))

vi.mock("@/lib/task/assignment-server", () => ({
  listTaskProjectBindings: mocks.listTaskProjectBindings,
}))

import { GET } from "@/app/tasks/assignments/route"

describe("task project assignment route", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.requireAccessOrUnauthorizedResponse.mockResolvedValue(null)
    mocks.listTaskProjectBindings.mockResolvedValue([
      {
        taskId: "task-a",
        taskTitle: "task-a",
        projectId: "project-1",
        projectTitle: "Alpha",
        source: "stored-runtime",
      },
      {
        taskId: "task-b",
        taskTitle: "task-b",
        projectId: "project-2",
        projectTitle: "Beta",
        source: "stored-runtime",
      },
    ])
  })

  it("останавливается на route guard до чтения assignment runtime", async () => {
    mocks.requireAccessOrUnauthorizedResponse.mockResolvedValueOnce(
      Response.json({ ok: false, error: "Требуется авторизация" }, { status: 401 }),
    )

    const response = await GET(new Request("http://localhost/tasks/assignments"))

    expect(response.status).toBe(401)
    expect(mocks.listTaskProjectBindings).not.toHaveBeenCalled()
  })

  it("возвращает только связи указанного проекта", async () => {
    const response = await GET(new Request("http://localhost/tasks/assignments?projectId=project-2"))

    expect(response.status).toBe(200)
    await expect(readJsonResponse(response)).resolves.toEqual({
      ok: true,
      bindings: [
        {
          taskId: "task-b",
          taskTitle: "task-b",
          projectId: "project-2",
          projectTitle: "Beta",
          source: "stored-runtime",
        },
      ],
    })
  })
})
