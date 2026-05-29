import {
  LIVE_ALLOWLIST_ENV,
  LIVE_ONBOARDING_ENV,
  LIVE_PROVIDER_ENV,
  describeMissingTestEnv,
  readLiveProviderEnv,
  readRequiredTestEnv,
  resolveLiveProvider,
  runLiveProviderPreflight,
} from "../../tools/testing/live-provider-preflight.mjs"

type TestEnv = Record<string, string | undefined>

type RequiredEnvResult =
  | {
      ok: true
      values: Record<string, string>
      missing: []
    }
  | {
      ok: false
      values: Record<string, string>
      missing: string[]
    }

type ProviderName = "openai" | "deepseek" | "gemini" | "claude" | "zai"

type LiveProviderResolution =
  | {
      ok: true
      provider: ProviderName
    }
  | {
      ok: false
      missing: string[]
      message: string
    }

type LiveProviderPreflightResult =
  | {
      checkedEnv: string[]
      exitCode: 0
      lines: string[]
      missing: []
      ok: true
      provider: ProviderName
    }
  | {
      checkedEnv: string[]
      exitCode: 1
      lines: string[]
      missing: string[]
      ok: false
      provider?: ProviderName
    }

export {
  LIVE_ALLOWLIST_ENV,
  LIVE_ONBOARDING_ENV,
  LIVE_PROVIDER_ENV,
  describeMissingTestEnv,
  readLiveProviderEnv,
  readRequiredTestEnv,
  resolveLiveProvider,
  runLiveProviderPreflight,
}
export type {
  LiveProviderPreflightResult,
  LiveProviderResolution,
  ProviderName,
  RequiredEnvResult,
  TestEnv,
}
