import { getClaudeMetrics } from "../metrics"
import { getOutputTextFromClaude } from "../output"
import { createProviderHttpContext, fetchProviderJson } from "../provider-http"
import type { LlmRequestRuntime, LlmStructuredRequest, LlmStructuredResponse, ProviderRuntimeConfig } from "../types"

const JSON_ONLY_SYSTEM_PROMPT =
  "Верни только валидный JSON-объект без markdown и без пояснений. Строго соблюдай ограничения из запроса пользователя."

type ClaudeContentPart =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: "image/png"; data: string } }

function getRequestImages(request: LlmStructuredRequest): string[] {
  return request.imageBase64List ?? (request.imageBase64 ? [request.imageBase64] : [])
}

function buildClaudeContent(request: LlmStructuredRequest, images: string[]): ClaudeContentPart[] {
  const content: ClaudeContentPart[] = images.map((imageBase64) => ({
    type: "image",
    source: {
      type: "base64",
      media_type: "image/png",
      data: imageBase64,
    },
  }))

  content.push({ type: "text", text: request.instruction })

  return content
}

async function callClaude(
  request: LlmStructuredRequest,
  config: ProviderRuntimeConfig,
  runtime: LlmRequestRuntime,
): Promise<LlmStructuredResponse> {
  const images = getRequestImages(request)
  const context = createProviderHttpContext("claude", request, config, images.length, runtime.timeoutMs)
  const data = await fetchProviderJson(
    context,
    `${config.baseUrl}/messages`,
    {
      method: "POST",
      signal: runtime.signal,
      headers: {
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
        "x-api-key": config.apiKey,
      },
      body: JSON.stringify({
        model: config.model,
        max_tokens: config.maxTokens,
        system: JSON_ONLY_SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildClaudeContent(request, images) }],
        output_config: {
          format: {
            type: "json_schema",
            schema: request.schema,
          },
        },
      }),
    },
    {
      network: "Не удалось подключиться к Claude API",
      provider: "Ошибка Claude API",
    },
  )

  return {
    provider: "claude",
    model: config.model,
    outputText: getOutputTextFromClaude(data),
    metrics: getClaudeMetrics(data),
  }
}

export { callClaude }
