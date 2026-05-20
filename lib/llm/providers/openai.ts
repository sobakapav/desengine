import { getOpenAIMetrics } from "../metrics"
import { getOutputTextFromOpenAI } from "../output"
import { createProviderHttpContext, fetchProviderJson } from "../provider-http"
import type { LlmRequestRuntime, LlmStructuredRequest, LlmStructuredResponse, ProviderRuntimeConfig } from "../types"

type OpenAIContentPart = { type: string; text?: string; image_url?: string }

function getRequestImages(request: LlmStructuredRequest): string[] {
  return request.imageBase64List ?? (request.imageBase64 ? [request.imageBase64] : [])
}

function buildOpenAIContent(request: LlmStructuredRequest, images: string[]): OpenAIContentPart[] {
  const content: OpenAIContentPart[] = [{ type: "input_text", text: request.instruction }]

  for (const imageBase64 of images) {
    content.push({ type: "input_image", image_url: `data:image/png;base64,${imageBase64}` })
  }

  return content
}

async function callOpenAI(
  request: LlmStructuredRequest,
  config: ProviderRuntimeConfig,
  runtime: LlmRequestRuntime,
): Promise<LlmStructuredResponse> {
  const images = getRequestImages(request)
  const context = createProviderHttpContext("openai", request, config, images.length, runtime.timeoutMs)
  const data = await fetchProviderJson(
    context,
    `${config.baseUrl}/responses`,
    {
      method: "POST",
      signal: runtime.signal,
      headers: {
        authorization: `Bearer ${config.apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: config.model,
        text: {
          format: {
            type: "json_schema",
            name: request.schemaName,
            strict: true,
            schema: request.schema,
          },
        },
        input: [{ role: "user", content: buildOpenAIContent(request, images) }],
      }),
    },
    {
      network: "Не удалось подключиться к OpenAI API",
      provider: "Ошибка OpenAI API",
    },
  )

  return {
    provider: "openai",
    model: config.model,
    outputText: getOutputTextFromOpenAI(data),
    metrics: getOpenAIMetrics(data),
  }
}

export { callOpenAI }
