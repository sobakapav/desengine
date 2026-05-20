// @openSpec capability: claude
// @openSpec scenarios:
// @openSpec  - "Оператор выбирает Claude"
// @openSpec  - "Оператор настраивает Claude"
// @openSpec  - "Claude включён как активный провайдер"
// @openSpec  - "Start или iterate выполняется с картинками через Claude"
// @openSpec  - "Авторизация Claude не прошла"
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Конфигурация выбрала Claude"
// @openSpec  - "Конфигурация провайдера неполная"
// @openSpec  - "Claude вернул ошибку"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { applyClaudeEnv, resetLlmTestEnv, restoreLlmTestEnv } from "./llm.server.test-utils"

describe("Claude adapter", () => {
  beforeEach(() => {
    resetLlmTestEnv()
  })

  afterEach(() => {
    restoreLlmTestEnv()
  })
  it("использует Claude как активный провайдер и отправляет structured JSON-запрос с картинками", async () => {
    applyClaudeEnv()
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          content: [
            {
              type: "text",
              text: '{"ok":true}',
            },
          ],
          stop_reason: "end_turn",
          usage: {
            input_tokens: 12,
            cache_creation_input_tokens: 2,
            cache_read_input_tokens: 3,
            output_tokens: 8,
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
      provider: "claude",
      label: "Claude",
      ready: true,
      endpoint: "https://api.anthropic.example/v1",
      config: {
        activeProvider: "claude",
        model: "claude-test",
        hasRequiredKey: true,
        missingEnvVars: [],
      },
    })

    const result = await runStructuredLlmRequest({
      instruction: "Верни JSON",
      imageBase64List: ["img-a", "img-b"],
      schemaName: "claude_schema",
      schema: {
        type: "object",
        properties: {
          ok: { type: "boolean" },
        },
        required: ["ok"],
      },
    })

    expect(result).toEqual({
      provider: "claude",
      model: "claude-test",
      outputText: '{"ok":true}',
      metrics: {
        status: "available",
        inputTokens: 17,
        outputTokens: 8,
        totalTokens: 25,
        costUsd: null,
      },
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("https://api.anthropic.example/v1/messages")
    expect(init.headers).toMatchObject({
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
      "x-api-key": "test-claude-key",
    })

    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({
      model: "claude-test",
      max_tokens: 4096,
      output_config: {
        format: {
          type: "json_schema",
          schema: {
            type: "object",
            properties: {
              ok: { type: "boolean" },
            },
            required: ["ok"],
          },
        },
      },
    })
    expect(body.messages).toEqual([
      {
        role: "user",
        content: [
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: "img-a",
            },
          },
          {
            type: "image",
            source: {
              type: "base64",
              media_type: "image/png",
              data: "img-b",
            },
          },
          { type: "text", text: "Верни JSON" },
        ],
      },
    ])
  })

  it("возвращает понятную auth-ошибку Claude без раскрытия ключа", async () => {
    applyClaudeEnv()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            error: {
              message: "Claude key rejected",
            },
          }),
          {
            status: 401,
            headers: { "content-type": "application/json" },
          },
        )
      }),
    )

    const { runStructuredLlmRequest, toLlmErrorResponse } = await import("../../lib/llm/server")

    const error = await runStructuredLlmRequest({
      instruction: "Проверка авторизации",
      schemaName: "claude_auth_schema",
      schema: { type: "object" },
    }).catch((caught) => caught)

    expect(toLlmErrorResponse(error)).toEqual({
      status: 502,
      body: {
        ok: false,
        error: "Claude key rejected",
        errorKind: "auth",
      },
    })
    expect(toLlmErrorResponse(error).body.error).not.toContain("test-claude-key")
  })

  it("требует явный CLAUDE_MAX_TOKENS для активного провайдера Claude", async () => {
    applyClaudeEnv()
    process.env.CLAUDE_MAX_TOKENS = ""

    const { runStructuredLlmRequest, toLlmErrorResponse } = await import("../../lib/llm/server")

    const error = await runStructuredLlmRequest({
      instruction: "Проверка конфига",
      schemaName: "claude_missing_max_tokens_schema",
      schema: { type: "object" },
    }).catch((caught) => caught)

    expect(toLlmErrorResponse(error)).toEqual({
      status: 400,
      body: {
        ok: false,
        error: "Для режима Claude не настроен CLAUDE_MAX_TOKENS",
        errorKind: "config",
      },
    })
  })
})
