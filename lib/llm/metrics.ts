import type { LlmUsageMetrics } from "./types"

function readUsage(data: unknown, field: "usage" | "usageMetadata"): Record<string, unknown> | null {
  const record = data && typeof data === "object" ? data as Record<string, unknown> : null
  const usage = record?.[field]

  return usage && typeof usage === "object"
    ? (usage as Record<string, unknown>)
    : null
}

function unavailableMetrics(): LlmUsageMetrics {
  return {
    status: "unavailable",
    reason: "provider_did_not_return_metrics",
  }
}

function getOpenAIMetrics(data: unknown): LlmUsageMetrics {
  const usage = readUsage(data, "usage")

  if (!usage) {
    return unavailableMetrics()
  }

  return {
    status: "available",
    inputTokens: typeof usage.input_tokens === "number" ? usage.input_tokens : null,
    outputTokens: typeof usage.output_tokens === "number" ? usage.output_tokens : null,
    totalTokens: typeof usage.total_tokens === "number" ? usage.total_tokens : null,
    costUsd: null,
  }
}

function getChatCompletionMetrics(data: unknown): LlmUsageMetrics {
  const usage = readUsage(data, "usage")

  if (!usage) {
    return unavailableMetrics()
  }

  return {
    status: "available",
    inputTokens: typeof usage.prompt_tokens === "number" ? usage.prompt_tokens : null,
    outputTokens: typeof usage.completion_tokens === "number" ? usage.completion_tokens : null,
    totalTokens: typeof usage.total_tokens === "number" ? usage.total_tokens : null,
    costUsd: null,
  }
}

function getGeminiMetrics(data: unknown): LlmUsageMetrics {
  const usage = readUsage(data, "usageMetadata")

  if (!usage) {
    return unavailableMetrics()
  }

  return {
    status: "available",
    inputTokens: typeof usage.promptTokenCount === "number" ? usage.promptTokenCount : null,
    outputTokens: typeof usage.candidatesTokenCount === "number" ? usage.candidatesTokenCount : null,
    totalTokens: typeof usage.totalTokenCount === "number" ? usage.totalTokenCount : null,
    costUsd: null,
  }
}

function getClaudeMetrics(data: unknown): LlmUsageMetrics {
  const usage = readUsage(data, "usage")

  if (!usage) {
    return unavailableMetrics()
  }

  const cacheCreation = typeof usage.cache_creation_input_tokens === "number" ? usage.cache_creation_input_tokens : 0
  const cacheRead = typeof usage.cache_read_input_tokens === "number" ? usage.cache_read_input_tokens : 0
  const inputTokens = typeof usage.input_tokens === "number" ? usage.input_tokens + cacheCreation + cacheRead : null
  const outputTokens = typeof usage.output_tokens === "number" ? usage.output_tokens : null

  return {
    status: "available",
    inputTokens,
    outputTokens,
    totalTokens: inputTokens !== null && outputTokens !== null ? inputTokens + outputTokens : null,
    costUsd: null,
  }
}

export {
  getChatCompletionMetrics,
  getClaudeMetrics,
  getGeminiMetrics,
  getOpenAIMetrics,
}
