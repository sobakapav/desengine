import { LlmError, mapFetchError } from "./errors"
import type { LlmStructuredRequest, ProviderRuntimeConfig } from "./types"

type ProviderHttpContext = {
  slug: string
  request: LlmStructuredRequest
  config: ProviderRuntimeConfig
  imageCount: number
  instructionLength: number
  timeoutMs: number | null
  startedAt: number
}

function createProviderHttpContext(
  slug: string,
  request: LlmStructuredRequest,
  config: ProviderRuntimeConfig,
  imageCount: number,
  timeoutMs: number | null,
  instructionLength = request.instruction.length,
): ProviderHttpContext {
  return {
    slug,
    request,
    config,
    imageCount,
    instructionLength,
    timeoutMs,
    startedAt: Date.now(),
  }
}

async function fetchProviderJson(
  context: ProviderHttpContext,
  url: string,
  init: RequestInit,
  messages: { network: string; provider: string },
): Promise<unknown> {
  let res: Response

  try {
    logProviderStart(context)
    res = await fetch(url, init)
  } catch (error) {
    logNetworkError(context, error)
    mapFetchError(error, messages.network)
  }

  const data = await res.json().catch(() => null)

  if (!res.ok) {
    const providerMessage = readProviderErrorMessage(data, messages.provider)
    const errorKind = res.status === 401 || res.status === 403 ? "auth" : "provider"

    logProviderError(context, res.status, providerMessage)
    throw new LlmError(errorKind, providerMessage)
  }

  logProviderSuccess(context, res.status)

  return data
}

function logProviderStart(context: ProviderHttpContext): void {
  console.log(`[desengine][${context.slug}] start`, {
    target: context.request.target ?? "default",
    model: context.config.model,
    imageCount: context.imageCount,
    instructionLength: context.instructionLength,
    schemaName: context.request.schemaName,
    timeoutMs: context.timeoutMs,
  })
}

function logNetworkError(context: ProviderHttpContext, error: unknown): void {
  console.error(`[desengine][${context.slug}] network_error`, {
    target: context.request.target ?? "default",
    model: context.config.model,
    durationMs: Date.now() - context.startedAt,
    message: error instanceof Error ? error.message : String(error),
  })
}

function logProviderError(context: ProviderHttpContext, status: number, message: string): void {
  console.error(`[desengine][${context.slug}] provider_error`, {
    target: context.request.target ?? "default",
    model: context.config.model,
    status,
    durationMs: Date.now() - context.startedAt,
    message,
  })
}

function logProviderSuccess(context: ProviderHttpContext, status: number): void {
  console.log(`[desengine][${context.slug}] success`, {
    target: context.request.target ?? "default",
    model: context.config.model,
    status,
    durationMs: Date.now() - context.startedAt,
  })
}

function readProviderErrorMessage(data: unknown, fallbackMessage: string): string {
  return data &&
    typeof data === "object" &&
    "error" in data &&
    data.error &&
    typeof data.error === "object" &&
    "message" in data.error &&
    typeof data.error.message === "string"
    ? data.error.message
    : fallbackMessage
}

export { createProviderHttpContext, fetchProviderJson }
