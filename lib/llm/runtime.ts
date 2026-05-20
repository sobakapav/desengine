import { LlmError } from "./errors"
import type { LlmRequestRuntime, LlmStructuredRequest } from "./types"

const DEFAULT_INIT_TIMEOUT_MS = 45_000

function parseTimeoutEnvVar(name: string): number | null {
  const rawValue = process.env[name]?.trim()

  if (!rawValue) {
    return null
  }

  if (!/^\d+$/.test(rawValue)) {
    throw new LlmError("config", `Переменная ${name} должна быть положительным числом миллисекунд`)
  }

  const timeoutMs = Number.parseInt(rawValue, 10)

  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new LlmError("config", `Переменная ${name} должна быть положительным числом миллисекунд`)
  }

  return timeoutMs
}

function getLlmRequestRuntime(target: LlmStructuredRequest["target"]): LlmRequestRuntime {
  if (target !== "init") {
    return {
      timeoutMs: null,
    }
  }

  const timeoutMs = parseTimeoutEnvVar("LLM_INIT_TIMEOUT_MS") ?? DEFAULT_INIT_TIMEOUT_MS

  return {
    timeoutMs,
    signal: AbortSignal.timeout(timeoutMs),
  }
}

export { getLlmRequestRuntime }
