import { getGeminiMetrics } from "../metrics"
import { getOutputTextFromGemini } from "../output"
import { createProviderHttpContext, fetchProviderJson } from "../provider-http"
import type { LlmRequestRuntime, LlmStructuredRequest, LlmStructuredResponse, ProviderRuntimeConfig } from "../types"

type GeminiPart = { text?: string; inline_data?: { mime_type: string; data: string } }

function getGeminiModelPath(model: string): string {
  return model.startsWith("models/") ? model : `models/${model}`
}

function getRequestImages(request: LlmStructuredRequest): string[] {
  return request.imageBase64List ?? (request.imageBase64 ? [request.imageBase64] : [])
}

function buildGeminiParts(request: LlmStructuredRequest, images: string[]): GeminiPart[] {
  const parts: GeminiPart[] = [{ text: request.instruction }]

  for (const imageBase64 of images) {
    parts.push({
      inline_data: {
        mime_type: "image/png",
        data: imageBase64,
      },
    })
  }

  return parts
}

async function callGemini(
  request: LlmStructuredRequest,
  config: ProviderRuntimeConfig,
  runtime: LlmRequestRuntime,
): Promise<LlmStructuredResponse> {
  const images = getRequestImages(request)
  const context = createProviderHttpContext("gemini", request, config, images.length, runtime.timeoutMs)
  const data = await fetchProviderJson(
    context,
    `${config.baseUrl}/${getGeminiModelPath(config.model)}:generateContent`,
    {
      method: "POST",
      signal: runtime.signal,
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": config.apiKey,
      },
      body: JSON.stringify({
        contents: [{ role: "user", parts: buildGeminiParts(request, images) }],
        generationConfig: {
          responseMimeType: "application/json",
          responseJsonSchema: request.schema,
        },
      }),
    },
    {
      network: "Не удалось подключиться к Google Gemini API",
      provider: "Ошибка Google Gemini API",
    },
  )

  return {
    provider: "gemini",
    model: config.model,
    outputText: getOutputTextFromGemini(data),
    metrics: getGeminiMetrics(data),
  }
}

export { callGemini }
