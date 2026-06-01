// @openSpec capability: onboarding-repo
// @openSpec scenarios:
// @openSpec  - "Пользователь хочет повторно обновить onboarding-контент"

import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  updateOnboardingFromConfig: vi.fn(),
}))

vi.mock("@/lib/onboarding/update", () => ({
  updateOnboardingFromConfig: mocks.updateOnboardingFromConfig,
}))

import { POST } from "@/app/api/onboarding/update/route"

describe("onboarding update route integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("возвращает commitHash и repoUrl при успешной синхронизации", async () => {
    mocks.updateOnboardingFromConfig.mockResolvedValue({
      commitHash: "abc123",
      repoUrl: "https://example.test/onboarding.git",
    })

    const response = await POST()

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      commitHash: "abc123",
      repoUrl: "https://example.test/onboarding.git",
    })
  })

  it("маппит runtime-ошибку обновления в HTTP 500", async () => {
    mocks.updateOnboardingFromConfig.mockRejectedValue(
      new Error("Не удалось выполнить git clone"),
    )

    const response = await POST()

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      ok: false,
      error: "Не удалось выполнить git clone",
    })
  })
})
