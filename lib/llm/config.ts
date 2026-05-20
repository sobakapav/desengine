import { LLM_PROVIDERS, type LlmProvider, type ProviderRuntimeConfig } from "./types"
import { LlmError } from "./errors"

function getLlmProvider(): LlmProvider {
  const rawProvider = process.env.LLM_PROVIDER?.trim().toLowerCase()

  if (!rawProvider) {
    return "openai"
  }

  if (LLM_PROVIDERS.includes(rawProvider as LlmProvider)) {
    return rawProvider as LlmProvider
  }

  throw new LlmError(
    "config",
    `Неподдерживаемый LLM_PROVIDER: ${rawProvider}. Поддерживаются: openai, deepseek, gemini, claude, zai.`,
  )
}

function readRequiredEnv(name: string, providerLabel: string): string {
  const value = process.env[name]?.trim()

  if (!value) {
    throw new LlmError("config", `Для режима ${providerLabel} не настроен ${name}`)
  }

  return value
}

function readPositiveIntegerEnv(name: string, providerLabel: string): number {
  const rawValue = readRequiredEnv(name, providerLabel)

  if (!/^\d+$/.test(rawValue)) {
    throw new LlmError("config", `Переменная ${name} должна быть положительным числом токенов`)
  }

  const value = Number.parseInt(rawValue, 10)

  if (!Number.isFinite(value) || value <= 0) {
    throw new LlmError("config", `Переменная ${name} должна быть положительным числом токенов`)
  }

  return value
}

function buildProviderConfig(
  provider: LlmProvider,
  label: string,
  env: { apiKey: string; model: string; baseUrl: string; maxTokens?: string },
): ProviderRuntimeConfig {
  return {
    provider,
    model: readRequiredEnv(env.model, label),
    apiKey: readRequiredEnv(env.apiKey, label),
    baseUrl: readRequiredEnv(env.baseUrl, label),
    ...(env.maxTokens ? { maxTokens: readPositiveIntegerEnv(env.maxTokens, label) } : {}),
  }
}

function ensureOpenAIConfig(): ProviderRuntimeConfig {
  return buildProviderConfig("openai", "OpenAI", {
    apiKey: "OPENAI_API_KEY",
    model: "OPENAI_MODEL",
    baseUrl: "OPENAI_BASE_URL",
  })
}

function ensureDeepSeekConfig(): ProviderRuntimeConfig {
  return buildProviderConfig("deepseek", "DeepSeek", {
    apiKey: "DEEPSEEK_API_KEY",
    model: "DEEPSEEK_MODEL",
    baseUrl: "DEEPSEEK_BASE_URL",
  })
}

function ensureGeminiConfig(): ProviderRuntimeConfig {
  return buildProviderConfig("gemini", "Google Gemini", {
    apiKey: "GEMINI_API_KEY",
    model: "GEMINI_MODEL",
    baseUrl: "GEMINI_BASE_URL",
  })
}

function ensureClaudeConfig(): ProviderRuntimeConfig {
  return buildProviderConfig("claude", "Claude", {
    apiKey: "CLAUDE_API_KEY",
    model: "CLAUDE_MODEL",
    baseUrl: "CLAUDE_BASE_URL",
    maxTokens: "CLAUDE_MAX_TOKENS",
  })
}

function ensureZaiConfig(): ProviderRuntimeConfig {
  return buildProviderConfig("zai", "Z.AI", {
    apiKey: "ZAI_API_KEY",
    model: "ZAI_MODEL",
    baseUrl: "ZAI_BASE_URL",
  })
}

function listConfiguredProviders(): LlmProvider[] {
  return LLM_PROVIDERS.filter((provider) => {
    const upperProvider = provider === "zai" ? "ZAI" : provider.toUpperCase()

    return Boolean(process.env[`${upperProvider}_API_KEY`]?.trim() || process.env[`${upperProvider}_MODEL`]?.trim())
  })
}

export {
  ensureClaudeConfig,
  ensureDeepSeekConfig,
  ensureGeminiConfig,
  ensureOpenAIConfig,
  ensureZaiConfig,
  getLlmProvider,
  listConfiguredProviders,
}
