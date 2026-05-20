/**
 * Типы и схемы доменной сущности LLM
 */


/** Настройка LLM — в desengine.config.txt, параметр LLM_PROVIDER */
export const LLM_PROVIDERS = [
  "openai",
  "deepseek",
  "gemini",
  "claude",
  "zai"
] as const

type LlmProvider =
  (typeof LLM_PROVIDERS)[number]


// TODO(owner:team-desengine, targetStage:6.6): выделить usage metrics в отдельный LLM cost module.
type LlmUsageMetrics =
  | {
      status: "available"
      inputTokens: number | null
      outputTokens: number | null
      totalTokens: number | null
      costUsd: number | null
    }
  | {
      status: "unavailable"
      reason: "provider_did_not_return_metrics"
    }

// TODO(owner:team-desengine, targetStage:6.6): выделить call record в отдельный LLM audit module.
type LlmCallRecord = {
  provider: LlmProvider
  model: string
  metrics: LlmUsageMetrics
}

// TODO(owner:team-desengine, targetStage:6.6): разделить runtime status и provider config status.
type LlmStatus = {
  provider: LlmProvider
  label: string
  ready: boolean
  endpoint: string
  config: {
    activeProvider: LlmProvider
    model: string | null
    hasRequiredKey: boolean
    missingEnvVars: string[]
    configuredProviders: LlmProvider[]
  }
  availability: {
    ok: boolean
    message: string
  }
}


// TODO(owner:team-desengine, targetStage:6.6): вынести structured request contract в provider boundary.
type LlmStructuredRequest = {
  instruction: string
  imageBase64?: string
  imageBase64List?: string[]
  schemaName: string
  schema: Record<string, unknown>
  target?: "default" | "init" | "check"
}

// TODO(owner:team-desengine, targetStage:6.6): вынести structured response contract в provider boundary.
type LlmStructuredResponse = {
  provider: LlmProvider
  model: string
  outputText: string
  metrics: LlmUsageMetrics
}

// TODO(owner:team-desengine, targetStage:6.6): вынести runtime config в provider adapter boundary.
type ProviderRuntimeConfig = {
  provider: LlmProvider
  model: string
  apiKey: string
  baseUrl: string
  maxTokens?: number
}

// TODO(owner:team-desengine, targetStage:6.6): вынести request runtime в provider adapter boundary.
type LlmRequestRuntime = {
  timeoutMs: number | null
  signal?: AbortSignal
}

// TODO(owner:team-desengine, targetStage:6.6): вынести adapter interface в provider adapter boundary.
type LlmAdapter = {
  provider: LlmProvider
  label: string
  envVars: {
    apiKey: string
    model: string
    baseUrl: string
    maxTokens?: string
  }
  buildConfig: () => ProviderRuntimeConfig
  call: (
    request: LlmStructuredRequest,
    config: ProviderRuntimeConfig,
    runtime: LlmRequestRuntime,
  ) => Promise<LlmStructuredResponse>
}



export type {
  LlmProvider,
  LlmUsageMetrics,
  LlmCallRecord,
  LlmStatus,
  LlmStructuredRequest,
  LlmStructuredResponse,
  ProviderRuntimeConfig,
  LlmRequestRuntime,
  LlmAdapter,
}
