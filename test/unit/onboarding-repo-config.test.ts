// @openSpec capability: onboarding-repo
// @openSpec scenarios:
// @openSpec  - "Система определяет источник onboarding-контента"
// @openSpec  - "Пользователь хочет повторно обновить onboarding-контент"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

const ORIGINAL_ENV = { ...process.env }

describe("onboarding repo config", () => {
  beforeEach(() => {
    vi.resetModules()
    process.env = { ...ORIGINAL_ENV }
    process.env.ONBOARDING_REPO_URL = ""
    process.env.DESENGINE_ONBOARDING_REPO_URL = ""
  })

  afterEach(() => {
    vi.restoreAllMocks()
    process.env = { ...ORIGINAL_ENV }
  })

  it("читает канонический источник onboarding из ONBOARDING_REPO_URL", async () => {
    process.env.ONBOARDING_REPO_URL = "https://example.com/onboarding.git"
    process.env.DESENGINE_ONBOARDING_REPO_URL = "https://example.com/legacy.git"

    const { getConfiguredOnboardingRepoUrl } = await import("@/lib/onboarding/server")

    expect(getConfiguredOnboardingRepoUrl()).toBe("https://example.com/onboarding.git")
  })

  it("сообщает про ONBOARDING_REPO_URL, если ручное обновление запущено без repo URL", async () => {
    const { updateOnboardingFromConfig } = await import("@/lib/onboarding/update")

    await expect(updateOnboardingFromConfig()).rejects.toThrow(
      "Не задан `ONBOARDING_REPO_URL` в desengine.config.txt.",
    )
  })
})
