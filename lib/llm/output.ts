import { LlmError } from "./errors"

function getMessageContent(data: unknown): string | null {
  const choices = data && typeof data === "object" && "choices" in data && Array.isArray(data.choices) ? data.choices : []
  const firstChoice = choices[0]
  const message =
    firstChoice &&
    typeof firstChoice === "object" &&
    "message" in firstChoice &&
    firstChoice.message &&
    typeof firstChoice.message === "object"
      ? (firstChoice.message as Record<string, unknown>)
      : null

  return message && typeof message.content === "string" && message.content.trim() ? message.content : null
}

function getOutputTextFromOpenAI(data: unknown): string {
  if (data && typeof data === "object" && "output_text" in data && typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text
  }

  const output = data && typeof data === "object" && "output" in data && Array.isArray(data.output) ? data.output : []

  for (const item of output) {
    const content = item && typeof item === "object" && Array.isArray(item.content) ? item.content : []
    for (const part of content) {
      if (part && typeof part === "object" && part.type === "output_text" && typeof part.text === "string" && part.text.trim()) {
        return part.text
      }
    }
  }

  throw new LlmError("invalid_response", "Провайдер вернул ответ без итогового текста")
}

function getOutputTextFromDeepSeek(data: unknown): string {
  const content = getMessageContent(data)

  if (content) {
    return content
  }

  throw new LlmError("invalid_response", "DeepSeek вернул ответ без итогового текста")
}

function getOutputTextFromZai(data: unknown): string {
  const choices = data && typeof data === "object" && "choices" in data && Array.isArray(data.choices) ? data.choices : []
  const firstChoice = choices[0]
  const finishReason =
    firstChoice && typeof firstChoice === "object" && "finish_reason" in firstChoice && typeof firstChoice.finish_reason === "string"
      ? firstChoice.finish_reason
      : null

  if (finishReason === "sensitive") {
    throw new LlmError("provider", "Z.AI заблокировал ответ из-за ограничений контента. Измените запрос и повторите попытку.")
  }

  const content = getMessageContent(data)

  if (content) {
    return content
  }

  throw new LlmError("invalid_response", "Z.AI вернул ответ без итогового текста")
}

function getGeminiBlockedMessage(blockReason: unknown): string {
  if (blockReason === "SAFETY" || blockReason === "IMAGE_SAFETY") {
    return "Google Gemini заблокировал запрос по safety-фильтру. Измените формулировку или изображение и повторите попытку."
  }

  if (blockReason === "BLOCKLIST" || blockReason === "PROHIBITED_CONTENT") {
    return "Google Gemini отклонил запрос из-за ограничений контента. Измените формулировку и повторите попытку."
  }

  return "Google Gemini заблокировал запрос. Измените формулировку и повторите попытку."
}

function getOutputTextFromGemini(data: unknown): string {
  const candidate = readFirstGeminiCandidate(data)
  const parts =
    candidate.content && typeof candidate.content === "object" && Array.isArray((candidate.content as Record<string, unknown>).parts)
      ? ((candidate.content as Record<string, unknown>).parts as unknown[])
      : []

  for (const part of parts) {
    if (part && typeof part === "object" && "text" in part && typeof part.text === "string" && part.text.trim()) {
      return part.text
    }
  }

  throw new LlmError("invalid_response", "Google Gemini вернул ответ без итогового текста")
}

function readFirstGeminiCandidate(data: unknown): Record<string, unknown> {
  const feedback =
    data && typeof data === "object" && "promptFeedback" in data && data.promptFeedback && typeof data.promptFeedback === "object"
      ? (data.promptFeedback as Record<string, unknown>)
      : null

  if (feedback?.blockReason) {
    throw new LlmError("provider", getGeminiBlockedMessage(feedback.blockReason))
  }

  const candidates = data && typeof data === "object" && "candidates" in data && Array.isArray(data.candidates) ? data.candidates : []
  const firstCandidate = candidates[0] && typeof candidates[0] === "object" ? (candidates[0] as Record<string, unknown>) : null

  if (!firstCandidate) {
    throw new LlmError("invalid_response", "Google Gemini вернул ответ без кандидатов")
  }

  assertGeminiFinishReason(firstCandidate.finishReason)

  return firstCandidate
}

function assertGeminiFinishReason(finishReason: unknown): void {
  if (finishReason === "SAFETY") {
    throw new LlmError("provider", "Google Gemini заблокировал ответ по safety-фильтру. Измените запрос и повторите попытку.")
  }

  if (finishReason === "RECITATION") {
    throw new LlmError("provider", "Google Gemini остановил ответ из-за ограничений на воспроизведение контента. Измените запрос и повторите попытку.")
  }

  if (finishReason === "LANGUAGE") {
    throw new LlmError("provider", "Google Gemini не принял запрос из-за ограничений языка. Измените формулировку и повторите попытку.")
  }
}

function getOutputTextFromClaude(data: unknown): string {
  const stopReason =
    data && typeof data === "object" && "stop_reason" in data && typeof data.stop_reason === "string" ? data.stop_reason : null

  if (stopReason === "refusal") {
    throw new LlmError("provider", "Claude отказался выполнить запрос. Измените формулировку и повторите попытку.")
  }

  const content = data && typeof data === "object" && "content" in data && Array.isArray(data.content) ? data.content : []

  for (const part of content) {
    if (part && typeof part === "object" && "type" in part && part.type === "text" && "text" in part && typeof part.text === "string" && part.text.trim()) {
      return part.text
    }
  }

  throw new LlmError("invalid_response", "Claude вернул ответ без итогового текста")
}

export {
  getOutputTextFromClaude,
  getOutputTextFromDeepSeek,
  getOutputTextFromGemini,
  getOutputTextFromOpenAI,
  getOutputTextFromZai,
}
