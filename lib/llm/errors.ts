type LlmErrorKind = "config" | "auth" | "network" | "timeout" | "provider" | "invalid_response"

class LlmError extends Error {
  kind: LlmErrorKind

  constructor(kind: LlmErrorKind, message: string) {
    super(message)
    this.kind = kind
  }
}

function mapFetchError(error: unknown, fallbackMessage: string): never {
  if (error instanceof LlmError) {
    throw error
  }

  if (error instanceof Error && error.name === "TimeoutError") {
    throw new LlmError("timeout", "LLM-провайдер не успел ответить вовремя. Повторите попытку.")
  }

  throw new LlmError("network", fallbackMessage)
}

/**
 * @example
 * ```ts
 * const response = toLlmErrorResponse(error)
 * return Response.json(response.body, { status: response.status })
 * ```
 */
function toLlmErrorResponse(error: unknown) {
  const llmError =
    error instanceof LlmError
      ? error
      : new LlmError("provider", error instanceof Error ? error.message : "Неизвестная ошибка LLM-провайдера")

  const status =
    llmError.kind === "config"
      ? 400
      : llmError.kind === "timeout"
        ? 504
        : llmError.kind === "auth" || llmError.kind === "network" || llmError.kind === "invalid_response"
          ? 502
          : 500

  return {
    status,
    body: {
      ok: false,
      error: llmError.message,
      errorKind: llmError.kind,
    },
  }
}

export { LlmError, mapFetchError, toLlmErrorResponse }
