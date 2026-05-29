// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Credentials не заданы"
// @openSpec  - "Разработчик запускает live/provider-проверку"

import { describe, expect, it } from "vitest"

import { runLiveProviderPreflight } from "../../tools/testing/live-provider-preflight.mjs"

describe("live provider preflight", () => {
  it("падает с безопасной диагностикой, если для активного provider не хватает env", () => {
    const result = runLiveProviderPreflight({
      LLM_PROVIDER: "gemini",
      GEMINI_MODEL: "gemini-2.5-flash",
      GEMINI_BASE_URL: "https://generativelanguage.googleapis.com/v1beta",
    })

    expect(result.exitCode).toBe(1)
    expect(result.ok).toBe(false)
    expect(result.lines).toContain("Provider/live preflight: not ready.")
    expect(result.lines).toContain(
      "Для live-проверки не хватает переменных окружения: GEMINI_API_KEY",
    )
    expect(result.lines).toContain("Реальные provider-вызовы не выполнялись.")
  })

  it("проходит, если env активного provider заполнен", () => {
    const result = runLiveProviderPreflight({
      LLM_PROVIDER: "openai",
      OPENAI_API_KEY: "test-openai-key",
      OPENAI_MODEL: "gpt-4.1-mini",
      OPENAI_BASE_URL: "https://api.openai.com/v1",
    })

    expect(result).toEqual({
      checkedEnv: ["LLM_PROVIDER", "OPENAI_API_KEY", "OPENAI_MODEL", "OPENAI_BASE_URL"],
      exitCode: 0,
      lines: [
        "Provider/live preflight: ready.",
        "Активный provider: openai.",
        "Проверены переменные: LLM_PROVIDER, OPENAI_API_KEY, OPENAI_MODEL, OPENAI_BASE_URL",
        "Реальные provider-вызовы не выполнялись.",
      ],
      missing: [],
      ok: true,
      provider: "openai",
    })
  })
})
