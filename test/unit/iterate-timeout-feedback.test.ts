// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Провайдер вернул ошибку"
// @openSpec  - "Initiator-запрос превысил отдельный timeout"
// @openSpec  - "Iterate-запрос превысил bounded timeout"
// @openSpec  - "Check-запрос превысил bounded timeout"
// @openSpec  - "Iterate или check превысили интерактивный timeout"
// @openSpec capability: iteration
// @openSpec scenarios:
// @openSpec  - "Провайдер вернул ошибку"
// @openSpec  - "Уточнение превысило bounded timeout"
// @openSpec  - "Iterate route завис без ответа"
// @openSpec capability: task-levels
// @openSpec scenarios:
// @openSpec  - "Техническая ошибка проверки не расходует лимит"
// @openSpec  - "Check route завис без ответа"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import { applyBaseEnv, resetLlmTestEnv, restoreLlmTestEnv } from "./llm.server.test-utils"

describe("iterate timeout feedback", () => {
  beforeEach(() => {
    resetLlmTestEnv()
    applyBaseEnv()
  })

  afterEach(() => {
    restoreLlmTestEnv()
  })

  it("даёт bounded timeout runtime для iterate и check", async () => {
    const timeoutSpy = vi.spyOn(AbortSignal, "timeout")
    process.env.LLM_ACTION_TIMEOUT_MS = "2345"

    const { getLlmRequestRuntime } = await import("@/lib/llm/runtime")

    expect(getLlmRequestRuntime("iterate").timeoutMs).toBe(2345)
    expect(getLlmRequestRuntime("check").timeoutMs).toBe(2345)
    expect(getLlmRequestRuntime("default").timeoutMs).toBeNull()
    expect(timeoutSpy).toHaveBeenNthCalledWith(1, 2345)
    expect(timeoutSpy).toHaveBeenNthCalledWith(2, 2345)
  })

  it("ругается на некорректный LLM_ACTION_TIMEOUT_MS", async () => {
    process.env.LLM_ACTION_TIMEOUT_MS = "oops"

    const { runStructuredLlmRequest, toLlmErrorResponse } = await import("@/lib/llm/server")

    const error = await runStructuredLlmRequest({
      target: "iterate",
      instruction: "Проверка таймаута",
      schemaName: "bad_action_timeout_schema",
      schema: { type: "object" },
    }).catch((caught) => caught)

    expect(toLlmErrorResponse(error)).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Переменная LLM_ACTION_TIMEOUT_MS должна быть положительным числом миллисекунд",
        errorKind: "config",
      },
    })
  })

  it("bounded client fetch возвращает timeout-ошибку без window", async () => {
    const { fetchWorkbenchActionJson } = await import("@/components/desengine/lab/Workbench/actionTimeout")

    const result = await fetchWorkbenchActionJson({
      url: "/api/tasks/task-a/iterate",
      actionLabel: "Уточнение",
      fallbackError: "Ошибка запуска итерации",
      timeoutMs: 10,
      init: { method: "POST" },
      fetchImpl: (_input, init) => new Promise((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => {
          const error = new Error("aborted")
          error.name = "AbortError"
          reject(error)
        })
      }) as ReturnType<typeof fetch>,
    })

    expect(result).toEqual({
      ok: false,
      error: "Не удалось дождаться ответа на действие \"Уточнение\". Повторите попытку.",
      errorKind: "timeout",
    })
  })

  it("снимает prompt pending и показывает retriable-ошибку при thrown postPrompt", async () => {
    const { runPromptSubmission } = await import("@/components/desengine/lab/Workbench/useWorkbenchPrompt")
    const pendingStates: boolean[] = []
    let errorMessage = ""

    await expect(runPromptSubmission({
      saveBeforeAction: async () => true,
      taskId: "task-a",
      promptText: "Сделай кнопку заметнее",
      currentLevelStarted: true,
      setPromptPending: (pending) => pendingStates.push(pending),
      setPromptStatus: () => undefined,
      setPromptError: (error) => {
        errorMessage = error
      },
      postPromptImpl: async () => {
        throw new Error("network down")
      },
    })).resolves.toEqual({
      kind: "error",
      error: "Ошибка запуска итерации",
    })

    expect(pendingStates).toEqual([true, false])
    expect(errorMessage).toBe("Ошибка запуска итерации")
  })

  it("снимает check pending и показывает retriable-ошибку при thrown postTaskCheck", async () => {
    const { runCheckSubmission } = await import("@/components/desengine/lab/Workbench/useWorkbenchTaskActions")
    const pendingStates: boolean[] = []
    let errorMessage = ""

    await expect(runCheckSubmission({
      taskId: "task-a",
      project: {
        id: "task-task-a",
        title: "Проект task-a",
        createdAt: "1970-01-01T00:00:00.000Z",
        updatedAt: "1970-01-01T00:00:00.000Z",
        settings: { uiKitId: "none" },
        migration: {
          state: "idle",
          sourceUiKitId: "none",
          targetUiKitId: "none",
          invalidationScope: "none",
          requiresReplay: false,
          message: "",
          startedAt: null,
          finishedAt: null,
        },
      },
      saveBeforeAction: async () => true,
      setCompletePending: (pending) => pendingStates.push(pending),
      setCompleteError: (error) => {
        errorMessage = error
      },
      postTaskCheckImpl: async () => {
        throw new Error("route stalled")
      },
    })).resolves.toEqual({
      kind: "error",
      error: "Не удалось запустить проверку результата",
    })

    expect(pendingStates).toEqual([true, false])
    expect(errorMessage).toBe("Не удалось запустить проверку результата")
  })
})
