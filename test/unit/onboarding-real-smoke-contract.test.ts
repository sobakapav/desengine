// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Разработчик запускает полный локальный тестовый слой"
// @openSpec  - "Разработчик запускает явную smoke-проверку реального onboarding checkout"
// @openSpec capability: external-local-onboarding
// @openSpec scenarios:
// @openSpec  - "Инженер сопровождения запускает проверку реального onboarding checkout"

import { describe, expect, it } from "vitest"

import { runRealOnboardingSmoke } from "../../tools/smoke-local-install/onboarding.mjs"

describe("real onboarding smoke contract", () => {
  it("требует ONBOARDING_REPO_URL и не подменяет его unit-фикстурой", async () => {
    const result = await runRealOnboardingSmoke(process.cwd(), {})

    expect(result.ok).toBe(false)
    expect(result.repairAttempted).toBe(false)
    expect(result.summary).toContain("не настроен")
    expect(result.detail).toContain("ONBOARDING_REPO_URL")
  })

  it("подтверждает уже синхронизированный checkout без repair", async () => {
    const result = await runRealOnboardingSmoke(
      process.cwd(),
      { ONBOARDING_REPO_URL: "https://example.com/onboarding.git" },
      {
        inspectOnboardingState: async () => ({
          state: "synced",
          detail: "Источник подтверждён, последний коммит: abc123.",
        }),
      },
    )

    expect(result.ok).toBe(true)
    expect(result.repairAttempted).toBe(false)
    expect(result.summary).toContain("уже подтверждён")
    expect(result.detail).toContain("abc123")
  })

  it("после repair повторно проверяет layout и источник, а не доверяет только коду завершения", async () => {
    let inspectCallCount = 0

    const result = await runRealOnboardingSmoke(
      process.cwd(),
      { ONBOARDING_REPO_URL: "https://example.com/onboarding.git" },
      {
        inspectOnboardingState: async () => {
          inspectCallCount += 1
          return inspectCallCount === 1
            ? { state: "unconfirmed", detail: "Маркер синхронизации отсутствует." }
            : { state: "missing", detail: "Не найден обязательный файл onboarding-контента: onboarding/prompts/default.njk." }
        },
        repairOnboarding: async () => ({
          ok: true,
          id: "onboarding-sync",
          summary: "Onboarding пересинхронизирован из канонического репозитория",
          detail: "Источник: https://example.com/onboarding.git. Коммит: abc123.",
        }),
      },
    )

    expect(result.ok).toBe(false)
    expect(result.repairAttempted).toBe(true)
    expect(result.summary).toContain("не подтверждён")
    expect(result.detail).toContain("После repair")
    expect(result.detail).toContain("default.njk")
    expect(inspectCallCount).toBe(2)
  })
})
