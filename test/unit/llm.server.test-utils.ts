import { vi } from "vitest"

vi.mock("server-only", () => ({}))

const ORIGINAL_ENV = { ...process.env }

export function resetLlmTestEnv() {
  vi.resetModules()
  process.env = { ...ORIGINAL_ENV }
}

export function restoreLlmTestEnv() {
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
  process.env = { ...ORIGINAL_ENV }
}

export function applyBaseEnv() {
  process.env.LLM_PROVIDER = "gemini"
  process.env.GEMINI_API_KEY = "test-gemini-key"
  process.env.GEMINI_MODEL = "gemini-2.5-flash"
  process.env.GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"
}

export function applyDeepSeekEnv() {
  process.env.LLM_PROVIDER = "deepseek"
  process.env.DEEPSEEK_API_KEY = "test-deepseek-key"
  process.env.DEEPSEEK_MODEL = "deepseek-test"
  process.env.DEEPSEEK_BASE_URL = "https://api.deepseek.example"
}

export function applyClaudeEnv() {
  process.env.LLM_PROVIDER = "claude"
  process.env.CLAUDE_API_KEY = "test-claude-key"
  process.env.CLAUDE_MODEL = "claude-test"
  process.env.CLAUDE_BASE_URL = "https://api.anthropic.example/v1"
  process.env.CLAUDE_MAX_TOKENS = "4096"
}

export function applyZaiEnv() {
  process.env.LLM_PROVIDER = "zai"
  process.env.ZAI_API_KEY = "test-zai-key"
  process.env.ZAI_MODEL = "glm-test"
  process.env.ZAI_BASE_URL = "https://api.z.ai.example/api/paas/v4"
}
