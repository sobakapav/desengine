import {
  ensureClaudeConfig,
  ensureDeepSeekConfig,
  ensureGeminiConfig,
  ensureOpenAIConfig,
  ensureZaiConfig,
  getLlmProvider,
} from "./config"
import { callClaude } from "./providers/claude"
import { callDeepSeek } from "./providers/deepseek"
import { callGemini } from "./providers/gemini"
import { callOpenAI } from "./providers/openai"
import { callZai } from "./providers/zai"
import type { LlmAdapter, LlmProvider } from "./types"

const ADAPTERS: Record<LlmProvider, LlmAdapter> = {
  openai: {
    provider: "openai",
    label: "OpenAI",
    envVars: {
      apiKey: "OPENAI_API_KEY",
      model: "OPENAI_MODEL",
      baseUrl: "OPENAI_BASE_URL",
    },
    buildConfig: ensureOpenAIConfig,
    call: callOpenAI,
  },
  deepseek: {
    provider: "deepseek",
    label: "DeepSeek",
    envVars: {
      apiKey: "DEEPSEEK_API_KEY",
      model: "DEEPSEEK_MODEL",
      baseUrl: "DEEPSEEK_BASE_URL",
    },
    buildConfig: ensureDeepSeekConfig,
    call: callDeepSeek,
  },
  gemini: {
    provider: "gemini",
    label: "Google Gemini",
    envVars: {
      apiKey: "GEMINI_API_KEY",
      model: "GEMINI_MODEL",
      baseUrl: "GEMINI_BASE_URL",
    },
    buildConfig: ensureGeminiConfig,
    call: callGemini,
  },
  claude: {
    provider: "claude",
    label: "Claude",
    envVars: {
      apiKey: "CLAUDE_API_KEY",
      model: "CLAUDE_MODEL",
      baseUrl: "CLAUDE_BASE_URL",
      maxTokens: "CLAUDE_MAX_TOKENS",
    },
    buildConfig: ensureClaudeConfig,
    call: callClaude,
  },
  zai: {
    provider: "zai",
    label: "Z.AI",
    envVars: {
      apiKey: "ZAI_API_KEY",
      model: "ZAI_MODEL",
      baseUrl: "ZAI_BASE_URL",
    },
    buildConfig: ensureZaiConfig,
    call: callZai,
  },
}

function getActiveAdapter(): LlmAdapter {
  return ADAPTERS[getLlmProvider()]
}

export { getActiveAdapter }
