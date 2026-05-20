import { getChatCompletionMetrics } from "../metrics"
import { getOutputTextFromZai } from "../output"
import { createProviderHttpContext, fetchProviderJson } from "../provider-http"
import type { LlmRequestRuntime, LlmStructuredRequest, LlmStructuredResponse, ProviderRuntimeConfig } from "../types"

const JSON_ONLY_SYSTEM_PROMPT =
  "Верни только валидный JSON-объект без markdown и без пояснений. Строго соблюдай ограничения из запроса пользователя."

type ZaiContentPart = { type: "text"; text: string } | { type: "image_url"; image_url: { url: string } }

function getRequestImages(request: LlmStructuredRequest): string[] {
  return request.imageBase64List ?? (request.imageBase64 ? [request.imageBase64] : [])
}

function buildZaiContent(request: LlmStructuredRequest, images: string[]): ZaiContentPart[] {
  const content: ZaiContentPart[] = images.map((imageBase64) => ({
    type: "image_url",
    image_url: {
      url: `data:image/png;base64,${imageBase64}`,
    },
  }))

  content.push({ type: "text", text: request.instruction })

  return content
}

async function callZai(
  request: LlmStructuredRequest,
  config: ProviderRuntimeConfig,
  runtime: LlmRequestRuntime,
): Promise<LlmStructuredResponse> {
  const images = getRequestImages(request)
  const context = createProviderHttpContext("zai", request, config, images.length, runtime.timeoutMs)
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
          { role: "user", content: buildZaiContent(request, images) },
        ],
        response_format: { type: "json_object" },
        stream: false,
      }),
    },
    {
      network: "Не удалось подключиться к Z.AI API",
      provider: "Ошибка Z.AI API",
    },
  )

  return {
    provider: "zai",
    model: config.model,
    outputText: getOutputTextFromZai(data),
    metrics: getChatCompletionMetrics(data),
  }
}

export { callZai }
