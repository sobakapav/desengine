// @openSpec capability: deepseek
// @openSpec scenarios:
// @openSpec  - "Оператор выбирает DeepSeek"
// @openSpec  - "Оператор настраивает DeepSeek"
// @openSpec  - "DeepSeek включён как активный провайдер"
// @openSpec  - "Авторизация DeepSeek не прошла"
// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Конфигурация выбрала DeepSeek"
// @openSpec  - "Оператор переключает активный провайдер"
// @openSpec  - "В конфиге лежат несколько провайдеров"
// @openSpec  - "Ошибка провайдера не раскрывает секретный ключ"
// @openSpec  - "Провайдер вернул ошибку"
// @openSpec  - "DeepSeek вернул ошибку"
// @openSpec  - "Провайдер не вернул метрики"
// @openSpec capability: llm-endpoint
// @openSpec scenarios:
// @openSpec  - "Оператор пытается настроить локальный endpoint"
// @openSpec  - "Система проверяет готовность LLM-конфигурации"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { applyDeepSeekEnv, resetLlmTestEnv, restoreLlmTestEnv } from "./llm.server.test-utils"

describe("DeepSeek adapter", () => {
  beforeEach(() => {
    resetLlmTestEnv()
  })

  afterEach(() => {
    restoreLlmTestEnv()
  })
  it("использует DeepSeek как активный провайдер и отправляет JSON-chat запрос", async () => {
    applyDeepSeekEnv()
    const fetchMock = vi.fn(async () => {
      return new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content: '{"ok":true}',
              },
            },
          ],
          usage: {
            prompt_tokens: 9,
            completion_tokens: 6,
            total_tokens: 15,
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
      provider: "deepseek",
      label: "DeepSeek",
      ready: true,
      endpoint: "https://api.deepseek.example",
      config: {
        activeProvider: "deepseek",
        model: "deepseek-test",
        hasRequiredKey: true,
        missingEnvVars: [],
      },
    })

    const result = await runStructuredLlmRequest({
      instruction: "Верни JSON",
      schemaName: "deepseek_schema",
      schema: { type: "object" },
    })

    expect(result).toEqual({
      provider: "deepseek",
      model: "deepseek-test",
      outputText: '{"ok":true}',
      metrics: {
        status: "available",
        inputTokens: 9,
        outputTokens: 6,
        totalTokens: 15,
        costUsd: null,
      },
    })

    const [url, init] = fetchMock.mock.calls[0] as unknown as [string, RequestInit]
    expect(url).toBe("https://api.deepseek.example/chat/completions")
    expect(init.headers).toMatchObject({
      authorization: "Bearer test-deepseek-key",
      "content-type": "application/json",
    })

    const body = JSON.parse(String(init.body))
    expect(body).toMatchObject({
      model: "deepseek-test",
      response_format: { type: "json_object" },
      stream: false,
    })
    expect(body.messages[1].content).toBe("Верни JSON")
  })

  it("явно отклоняет image-bearing запрос без тихой деградации в text-only", async () => {
    applyDeepSeekEnv()
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const { runStructuredLlmRequest, toLlmErrorResponse } = await import("../../lib/llm/server")

    const error = await runStructuredLlmRequest({
      instruction: "Опиши изображение",
      imageBase64List: ["img-a"],
      schemaName: "deepseek_vision_schema",
      schema: { type: "object" },
      target: "check",
    }).catch((caught) => caught)

    expect(fetchMock).not.toHaveBeenCalled()
    expect(toLlmErrorResponse(error)).toEqual({
      status: 400,
      body: {
        ok: false,
        error:
          "DeepSeek в текущем endpoint не поддерживает запросы с изображениями. Выберите провайдера с vision-поддержкой или повторите без изображений.",
        errorKind: "config",
      },
    })
  })
  it("возвращает понятную auth-ошибку DeepSeek", async () => {
    applyDeepSeekEnv()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            error: {
              message: "DeepSeek key rejected",
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
      schemaName: "deepseek_auth_schema",
      schema: { type: "object" },
    }).catch((caught) => caught)

    expect(toLlmErrorResponse(error)).toEqual({
      status: 502,
      body: {
        ok: false,
        error: "DeepSeek key rejected",
        errorKind: "auth",
      },
    })
    expect(toLlmErrorResponse(error).body.error).not.toContain("test-deepseek-key")
  })

  it("показывает готовность только выбранного сетевого провайдера при нескольких конфигах", async () => {
    applyDeepSeekEnv()
    process.env.OPENAI_API_KEY = "test-openai-key"
    process.env.OPENAI_MODEL = "gpt-test"
    process.env.OPENAI_BASE_URL = "https://api.openai.example/v1"
    process.env.GEMINI_API_KEY = "test-gemini-key"
    process.env.GEMINI_MODEL = "gemini-test"
    process.env.GEMINI_BASE_URL = "https://gemini.example/v1beta"
    process.env.CLAUDE_API_KEY = "test-claude-key"
    process.env.CLAUDE_MODEL = "claude-test"
    process.env.CLAUDE_BASE_URL = "https://api.anthropic.example/v1"
    process.env.CLAUDE_MAX_TOKENS = "4096"
    process.env.ZAI_API_KEY = "test-zai-key"
    process.env.ZAI_MODEL = "glm-test"
    process.env.ZAI_BASE_URL = "https://api.z.ai.example/api/paas/v4"

    const { getLlmStatus } = await import("../../lib/llm/server")

    const status = await getLlmStatus()

    expect(status).toMatchObject({
      provider: "deepseek",
      ready: true,
      endpoint: "https://api.deepseek.example",
      config: {
        activeProvider: "deepseek",
        configuredProviders: ["openai", "deepseek", "gemini", "claude", "zai"],
      },
    })
  })

  it("не считает локальный LLM endpoint поддерживаемым provider-режимом", async () => {
    process.env.LLM_PROVIDER = "local"
    process.env.OPENAI_API_KEY = ""
    process.env.OPENAI_MODEL = ""
    process.env.OPENAI_BASE_URL = "http://127.0.0.1:11434/v1"

    const { getLlmStatus } = await import("../../lib/llm/server")

    await expect(getLlmStatus()).resolves.toMatchObject({
      provider: "openai",
      ready: false,
      config: {
        activeProvider: "openai",
        missingEnvVars: ["LLM_PROVIDER"],
      },
      availability: {
        ok: false,
        message: "Неподдерживаемый LLM_PROVIDER: local. Поддерживаются: openai, deepseek, gemini, claude, zai.",
      },
    })
  })

  it("отмечает отсутствие provider metrics отдельно от учебной стоимости", async () => {
    applyDeepSeekEnv()
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        return new Response(
          JSON.stringify({
            choices: [
              {
                message: {
                  content: '{"ok":true}',
                },
              },
            ],
          }),
          {
            status: 200,
            headers: { "content-type": "application/json" },
          },
        )
      }),
    )

    const { runStructuredLlmRequest } = await import("../../lib/llm/server")

    const result = await runStructuredLlmRequest({
      instruction: "Верни JSON",
      schemaName: "no_metrics_schema",
      schema: { type: "object" },
    })

    expect(result.metrics).toEqual({
      status: "unavailable",
      reason: "provider_did_not_return_metrics",
    })
  })
})
