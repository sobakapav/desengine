import { getChatCompletionMetrics } from "../metrics"
import { getOutputTextFromDeepSeek } from "../output"
import { createProviderHttpContext, fetchProviderJson } from "../provider-http"
import type { LlmRequestRuntime, LlmStructuredRequest, LlmStructuredResponse, ProviderRuntimeConfig } from "../types"

const JSON_ONLY_SYSTEM_PROMPT =
  "Верни только валидный JSON-объект без markdown и без пояснений. Строго соблюдай ограничения из запроса пользователя."

function getRequestImages(request: LlmStructuredRequest): string[] {
  return request.imageBase64List ?? (request.imageBase64 ? [request.imageBase64] : [])
}

function buildDeepSeekInstruction(request: LlmStructuredRequest, images: string[]): string {
  if (images.length === 0) {
    return request.instruction
  }

  return `${request.instruction}

[СИСТЕМНОЕ ОГРАНИЧЕНИЕ ПРОВАЙДЕРА]
Изображения текущего уровня в этом вызове недоступны. Не придумывай конкретные визуальные детали, которых нет в текстовом контексте.`
}

function warnAboutOmittedImages(request: LlmStructuredRequest, config: ProviderRuntimeConfig, imageCount: number): void {
  if (imageCount === 0) {
    return
  }

  console.warn("[desengine][deepseek] images_omitted", {
    target: request.target ?? "default",
    model: config.model,
    imageCount,
  })
}

async function callDeepSeek(
  request: LlmStructuredRequest,
  config: ProviderRuntimeConfig,
  runtime: LlmRequestRuntime,
): Promise<LlmStructuredResponse> {
  const images = getRequestImages(request)
  const instruction = buildDeepSeekInstruction(request, images)
  const context = createProviderHttpContext("deepseek", request, config, images.length, runtime.timeoutMs, instruction.length)

  warnAboutOmittedImages(request, config, images.length)

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
