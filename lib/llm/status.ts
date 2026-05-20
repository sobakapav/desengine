import { getActiveAdapter } from "./adapters"
import { listConfiguredProviders } from "./config"
import type { LlmAdapter, LlmStatus } from "./types"

function getMissingEnvVars(adapter: LlmAdapter): string[] {
  return [
    process.env[adapter.envVars.model]?.trim() ? null : adapter.envVars.model,
    process.env[adapter.envVars.apiKey]?.trim() ? null : adapter.envVars.apiKey,
    process.env[adapter.envVars.baseUrl]?.trim() ? null : adapter.envVars.baseUrl,
    adapter.envVars.maxTokens && !process.env[adapter.envVars.maxTokens]?.trim() ? adapter.envVars.maxTokens : null,
  ].filter((value): value is string => Boolean(value))
}

function buildUnavailableStatus(message: string): LlmStatus {
  return {
    provider: "openai",
    label: "LLM",
    ready: false,
    endpoint: "",
    config: {
      activeProvider: "openai",
      model: null,
      hasRequiredKey: false,
      missingEnvVars: ["LLM_PROVIDER"],
      configuredProviders: listConfiguredProviders(),
    },
    availability: {
      ok: false,
      message,
    },
  }
}

function buildReadyStatus(adapter: LlmAdapter): LlmStatus {
  const config = adapter.buildConfig()

  return {
    provider: adapter.provider,
    label: adapter.label,
    ready: true,
    endpoint: config.baseUrl,
    config: {
      activeProvider: adapter.provider,
      model: config.model,
      hasRequiredKey: true,
      missingEnvVars: [],
      configuredProviders: listConfiguredProviders(),
    },
    availability: {
      ok: true,
      message: `${adapter.label} настроен`,
    },
  }
}

function buildInvalidConfigStatus(adapter: LlmAdapter, message: string): LlmStatus {
  return {
    provider: adapter.provider,
    label: adapter.label,
    ready: false,
    endpoint: process.env[adapter.envVars.baseUrl]?.trim() || "",
    config: {
      activeProvider: adapter.provider,
      model: process.env[adapter.envVars.model]?.trim() || null,
      hasRequiredKey: Boolean(process.env[adapter.envVars.apiKey]?.trim()),
      missingEnvVars: getMissingEnvVars(adapter),
      configuredProviders: listConfiguredProviders(),
    },
    availability: {
      ok: false,
      message,
    },
  }
}

/**
 * @example
 * ```ts
 * const status = await getLlmStatus()
 * if (!status.ready) console.log(status.availability.message)
 * ```
 */
async function getLlmStatus(): Promise<LlmStatus> {
  let adapter: LlmAdapter

  try {
    adapter = getActiveAdapter()
  } catch (error) {
    const message = error instanceof Error ? error.message : "Не удалось определить активный LLM-провайдер"

    return buildUnavailableStatus(message)
  }

  try {
    return buildReadyStatus(adapter)
  } catch (error) {
    const message = error instanceof Error ? error.message : `Конфигурация ${adapter.label} некорректна`

    return buildInvalidConfigStatus(adapter, message)
  }
}

export { getLlmStatus }
