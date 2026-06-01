// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Клиент запрашивает статус LLM"

import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  getLlmStatus: vi.fn(),
}))

vi.mock("@/lib/llm/server", () => ({
  getLlmStatus: mocks.getLlmStatus,
}))

import { GET } from "@/app/api/status/llm/route"

describe("llm status route integration", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("возвращает универсальный JSON status с ok=true", async () => {
    mocks.getLlmStatus.mockResolvedValue({
      provider: "openai",
      ready: true,
      config: { activeProvider: "openai" },
    })

    const response = await GET()

    expect(mocks.getLlmStatus).toHaveBeenCalledTimes(1)
    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      ok: true,
      provider: "openai",
      ready: true,
      config: { activeProvider: "openai" },
    })
  })
})
