// @openSpec capability: resource-status
// @openSpec scenarios:
// @openSpec  - "Авторизация не ждёт sequential network probes диагностики"
// @openSpec  - "Параллельные probes не переставляют порядок resource cards"
// @openSpec  - "Разработчик запускает unit-проверку статусов ресурсов"

import { beforeEach, describe, expect, it, vi } from "vitest"

const mocks = vi.hoisted(() => ({
  addAccessAndReleaseResources: vi.fn(),
  addAllowlistResources: vi.fn(),
  addLlmResources: vi.fn(),
  addOnboardingResources: vi.fn(),
  createResourceCollector: vi.fn(),
  getAccessControlConfig: vi.fn(),
  getAccessSessionState: vi.fn(),
  getLlmStatus: vi.fn(),
  getLocalConfigState: vi.fn(),
  getOnboardingSyncStatus: vi.fn(),
  getSystemReleaseStatus: vi.fn(),
  loadLocalConfig: vi.fn(),
  updateOnboardingFromConfig: vi.fn(),
}))

vi.mock("@/lib/auth/server", () => ({
  getAccessControlConfig: mocks.getAccessControlConfig,
  getAccessSessionState: mocks.getAccessSessionState,
}))

vi.mock("@/lib/llm/server", () => ({
  getLlmStatus: mocks.getLlmStatus,
}))

vi.mock("@/lib/onboarding/server", () => ({
  getOnboardingSyncStatus: mocks.getOnboardingSyncStatus,
}))

vi.mock("@/lib/onboarding/update", () => ({
  updateOnboardingFromConfig: mocks.updateOnboardingFromConfig,
}))

vi.mock("@/lib/system/release", () => ({
  getSystemReleaseStatus: mocks.getSystemReleaseStatus,
}))

vi.mock("@/lib/system/resources/internalstate-sections", () => ({
  addAccessAndReleaseResources: mocks.addAccessAndReleaseResources,
  addAllowlistResources: mocks.addAllowlistResources,
  addLlmResources: mocks.addLlmResources,
  addOnboardingResources: mocks.addOnboardingResources,
  createResourceCollector: mocks.createResourceCollector,
}))

vi.mock("@/lib/system/config/local.cjs", () => ({
  default: {
    getLocalConfigState: mocks.getLocalConfigState,
    loadLocalConfig: mocks.loadLocalConfig,
  },
}))

describe("resource internalstate", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()

    mocks.getLlmStatus.mockResolvedValue({
      provider: "openai",
      label: "OpenAI",
      ready: true,
      endpoint: "https://api.openai.example/v1",
      config: {
        activeProvider: "openai",
        configuredProviders: ["openai"],
        hasRequiredKey: true,
        missingEnvVars: [],
        model: "gpt-test",
      },
      availability: {
        ok: true,
        message: "OpenAI настроен",
      },
    })
    mocks.getAccessSessionState.mockResolvedValue("missing")
    mocks.getAccessControlConfig.mockReturnValue({
      baseUrl: "https://allowlist.example",
      isConfigured: true,
      salt: "salt",
    })
    mocks.getOnboardingSyncStatus.mockResolvedValue({
      state: "confirmed",
      detail: "ok",
      summary: "ok",
      legacyPaths: [],
    })
    mocks.getSystemReleaseStatus.mockResolvedValue({
      branch: "main",
      canUpdate: false,
      condition: "upToDate",
      currentVersion: "v0.1.0",
      dirty: false,
      dirtyWorkspaceNote: "",
      latestVersion: "v0.1.0",
      message: "ok",
      nearestVersion: "v0.1.0",
      remoteUrl: "https://example.com/desengine.git",
      updateSafety: "ok",
    })
    mocks.getLocalConfigState.mockReturnValue({
      hasConfig: true,
      hasLegacyEnv: false,
    })
    mocks.createResourceCollector.mockReturnValue({
      items: [],
      instructions: [],
      add: vi.fn(),
    })
  })

  it("запускает LLM и allowlist network probes параллельно", async () => {
    const events: string[] = []
    let resolveLlm: (() => void) | null = null
    let resolveAllowlist: (() => void) | null = null

    mocks.addLlmResources.mockImplementation(async () => {
      events.push("llm:start")
      await new Promise<void>((resolve) => {
        resolveLlm = resolve
      })
      events.push("llm:end")
    })
    mocks.addAllowlistResources.mockImplementation(async () => {
      events.push("allowlist:start")
      await new Promise<void>((resolve) => {
        resolveAllowlist = resolve
      })
      events.push("allowlist:end")
    })

    const { getResourceStates } = await import("@/lib/system/resources/internalstate")
    const pending = getResourceStates()

    await new Promise((resolve) => setTimeout(resolve, 0))

    expect(events).toEqual(["llm:start", "allowlist:start"])

    resolveLlm?.()
    resolveAllowlist?.()

    await expect(pending).resolves.toMatchObject({
      allowlistConfigured: true,
      authState: "missing",
      hasAccess: false,
      onboardingSyncState: "confirmed",
      readyForProtectedLab: false,
    })
  })

  it("сохраняет стабильный порядок resource cards после параллельных probes", async () => {
    mocks.createResourceCollector.mockImplementation(() => {
      const items: Array<{ id: string }> = []
      const instructions: Array<{ id: string }> = []

      return {
        items,
        instructions,
        add(id: string) {
          items.push({ id })
        },
      }
    })
    mocks.addLlmResources.mockImplementation(async (resources) => {
      await new Promise((resolve) => setTimeout(resolve, 10))
      resources.add("llm-network", "ready")
    })
    mocks.addAllowlistResources.mockImplementation(async (resources) => {
      resources.add("allowlist-network", "ready")
    })

    const { getResourceStates } = await import("@/lib/system/resources/internalstate")

    await expect(getResourceStates()).resolves.toMatchObject({
      items: [
        { id: "llm-network" },
        { id: "allowlist-network" },
      ],
    })
  })
})
