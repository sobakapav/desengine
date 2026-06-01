import { getChatCompletionMetrics } from "../metrics"
import { LlmError } from "../errors"
import { getOutputTextFromDeepSeek } from "../output"
import { createProviderHttpContext, fetchProviderJson } from "../provider-http"
import type { LlmRequestRuntime, LlmStructuredRequest, LlmStructuredResponse, ProviderRuntimeConfig } from "../types"

const JSON_ONLY_SYSTEM_PROMPT =
  "Верни только валидный JSON-объект без markdown и без пояснений. Строго соблюдай ограничения из запроса пользователя."

function getRequestImages(request: LlmStructuredRequest): string[] {
  return request.imageBase64List ?? (request.imageBase64 ? [request.imageBase64] : [])
}

function throwIfDeepSeekImagesUnsupported(request: LlmStructuredRequest, config: ProviderRuntimeConfig, imageCount: number): void {
  if (imageCount === 0) {
    return
  }

  console.error("[desengine][deepseek] images_unsupported", {
    target: request.target ?? "default",
    model: config.model,
    imageCount,
  })

  throw new LlmError(
    "config",
    "DeepSeek в текущем endpoint не поддерживает запросы с изображениями. Выберите провайдера с vision-поддержкой или повторите без изображений.",
  )
}

async function callDeepSeek(
  request: LlmStructuredRequest,
  config: ProviderRuntimeConfig,
  runtime: LlmRequestRuntime,
): Promise<LlmStructuredResponse> {
  const images = getRequestImages(request)
  throwIfDeepSeekImagesUnsupported(request, config, images.length)
  const instruction = request.instruction
  const context = createProviderHttpContext("deepseek", request, config, images.length, runtime.timeoutMs, instruction.length)

  const data = await fetchProviderJson(
    context,
    `${config.baseUrl}/chat/completions`,
    {
      method: "POST",
      signal: runtime.signal,
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: JSON_ONLY_SYSTEM_PROMPT },
          { role: "user", content: instruction },
        ],
        response_format: { type: "json_object" },
        stream: false,
      }),
    },
    {
      network: "Не удалось подключиться к DeepSeek API",
      provider: "Ошибка DeepSeek API",
    },
  )

  return {
    provider: "deepseek",
    model: config.model,
    outputText: getOutputTextFromDeepSeek(data),
    metrics: getChatCompletionMetrics(data),
  }
}

export { callDeepSeek }
