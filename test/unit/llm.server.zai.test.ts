// @openSpec capability: zai
// @openSpec scenarios:
// @openSpec  - "Оператор выбирает Z.AI"
// @openSpec  - "Оператор настраивает Z.AI"
// @openSpec  - "Z.AI включён как активный провайдер"
// @openSpec  - "Start или iterate выполняется с картинками через Z.AI"
// @openSpec  - "Авторизация Z.AI не прошла"
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Конфигурация выбрала Z.AI"
// @openSpec  - "Z.AI вернул ошибку"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { applyZaiEnv, resetLlmTestEnv, restoreLlmTestEnv } from "./llm.server.test-utils"

describe("Z.AI adapter", () => {
  beforeEach(() => {
    resetLlmTestEnv()
  })

  afterEach(() => {
    restoreLlmTestEnv()
  })
  it("использует Z.AI как активный провайдер и отправляет JSON-chat запрос с картинками", async () => {
    applyZaiEnv()
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: '{"ok":true}',
              },
              finish_reason: "stop",
            },
          ],
          usage: {
            prompt_tokens: 13,
            completion_tokens: 7,
            total_tokens: 20,
          },
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      )
    })
    vi.stubGlobal("fetch", fetchMock)

    const { getLlmStatus, runStructuredLlmRequest } = await import("../../lib/llm/server")

    await expect(getLlmStatus()).resolves.toMatchObject({
      provider: "zai",
      label: "Z.AI",
      ready: true,
      endpoint: "https://api.z.ai.example/api/paas/v4",
      config: {
        activeProvider: "zai",
        model: "glm-test",
        hasRequiredKey: true,
        missingEnvVars: [],
      },
    })

    const result = await runStructuredLlmRequest({
      instruction: "Верни JSON",
      imageBase64List: ["img-a", "img-b"],
      schemaName: "zai_schema",
      schema: { type: "object" },
    })

    expect(result).toEqual({
      provider: "zai",
      model: "glm-test",
      outputText: '{"ok":true}',
      metrics: {
        status: "available",
        inputTokens: 13,
        outputTokens: 7,
        totalTokens: 20,
        costUsd: null,
      },
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("https://api.z.ai.example/api/paas/v4/chat/completions")
    expect(init.headers).toMatchObject({
      authorization: "Bearer test-zai-key",
      "content-type": "application/json",
    })

    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({
      model: "glm-test",
      response_format: { type: "json_object" },
      stream: false,
    })
    expect(body.messages).toEqual([
      {
        role: "system",
        content:
          "Верни только валидный JSON-объект без markdown и без пояснений. Строго соблюдай ограничения из запроса пользователя.",
      },
      {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: { url: "data:image/png;base64,img-a" },
          },
          {
            type: "image_url",
            image_url: { url: "data:image/png;base64,img-b" },
          },
          { type: "text", text: "Верни JSON" },
        ],
      },
    ])
  })

  it("возвращает понятную auth-ошибку Z.AI без раскрытия ключа", async () => {
    applyZaiEnv()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            error: {
              message: "Z.AI key rejected",
            },
          }),
          {
            status: 403,
            headers: { "content-type": "application/json" },
          },
        )
      }),
    )

    const { runStructuredLlmRequest, toLlmErrorResponse } = await import("../../lib/llm/server")

    const error = await runStructuredLlmRequest({
      instruction: "Проверка авторизации",
      schemaName: "zai_auth_schema",
      schema: { type: "object" },
    }).catch((caught) => caught)

    expect(toLlmErrorResponse(error)).toEqual({
      status: 502,
      body: {
        ok: false,
        error: "Z.AI key rejected",
        errorKind: "auth",
      },
    })
    expect(toLlmErrorResponse(error).body.error).not.toContain("test-zai-key")
  })

  it("требует явный ZAI_BASE_URL для активного провайдера Z.AI", async () => {
    applyZaiEnv()
    process.env.ZAI_BASE_URL = ""

    const { runStructuredLlmRequest, toLlmErrorResponse } = await import("../../lib/llm/server")

    const error = await runStructuredLlmRequest({
      instruction: "Проверка конфига",
      schemaName: "zai_missing_base_url_schema",
      schema: { type: "object" },
    }).catch((caught) => caught)

    expect(toLlmErrorResponse(error)).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Для режима Z.AI не настроен ZAI_BASE_URL",
        errorKind: "config",
      },
    })
  })
})
