const geminiJsonSuccessResponse = {
  candidates: [
    {
      content: {
        parts: [{ text: "{\"ok\":true}" }],
      },
      finishReason: "STOP",
    },
  ],
  usageMetadata: {
    promptTokenCount: 11,
    candidatesTokenCount: 7,
    totalTokenCount: 18,
  },
}

const geminiSafetyBlockResponse = {
  promptFeedback: {
    blockReason: "SAFETY",
  },
}

const openAiJsonSuccessResponse = {
  choices: [
    {
      message: {
        content: "{\"ok\":true}",
      },
    },
  ],
  usage: {
    prompt_tokens: 11,
    completion_tokens: 7,
    total_tokens: 18,
  },
}

const deepSeekJsonSuccessResponse = {
  choices: [
    {
      message: {
        content: "{\"ok\":true}",
      },
    },
  ],
  usage: {
    prompt_tokens: 9,
    completion_tokens: 6,
    total_tokens: 15,
  },
}

const claudeJsonSuccessResponse = {
  content: [
    {
      type: "text",
      text: "{\"ok\":true}",
    },
  ],
  stop_reason: "end_turn",
  usage: {
    input_tokens: 12,
    output_tokens: 8,
  },
}

const zaiJsonSuccessResponse = {
  choices: [
    {
      message: {
        content: "{\"ok\":true}",
      },
      finish_reason: "stop",
    },
  ],
  usage: {
    prompt_tokens: 13,
    completion_tokens: 7,
    total_tokens: 20,
  },
}

export {
  claudeJsonSuccessResponse,
  deepSeekJsonSuccessResponse,
  geminiJsonSuccessResponse,
  geminiSafetyBlockResponse,
  openAiJsonSuccessResponse,
  zaiJsonSuccessResponse,
}
