// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Разработчик запускает integration-проверку server/API-flow"
// @openSpec  - "Проверка использует временное пользовательское состояние"

import { describe, expect, it } from "vitest"

import { invokeRouteWithParams } from "./helpers/route-harness"
import { createTempUserStateRoot } from "./helpers/temp-user-state"

describe("integration runner foundation", () => {
  it("вызывает route handler с Request и async params без браузера", async () => {
    const handler = async (
      request: Request,
      context: { params: Promise<Record<string, string>> },
    ) => {
      const params = await context.params

      return Response.json({
        ok: true,
        method: request.method,
        taskId: params.taskId,
      })
    }

    const result = await invokeRouteWithParams<
      undefined,
      { ok: true; method: string; taskId: string }
    >(handler, {
      method: "GET",
      params: { taskId: "task-1" },
      url: "http://localhost/api/tasks/task-1",
    })

    expect(result.response.status).toBe(200)
    expect(result.json).toEqual({
      ok: true,
      method: "GET",
      taskId: "task-1",
    })
  })

  it("создаёт и очищает временное пользовательское состояние вне рабочего user каталога", async () => {
    const tempUserState = await createTempUserStateRoot()

    expect(tempUserState.root).toContain("desengine-integration-user-")

    await tempUserState.cleanup()
  })
})
