import { pathToFileURL } from "node:url"

const LIVE_PROVIDER_ENV = {
  openai: ["LLM_PROVIDER", "OPENAI_API_KEY", "OPENAI_MODEL", "OPENAI_BASE_URL"],
  deepseek: ["LLM_PROVIDER", "DEEPSEEK_API_KEY", "DEEPSEEK_MODEL", "DEEPSEEK_BASE_URL"],
  gemini: ["LLM_PROVIDER", "GEMINI_API_KEY", "GEMINI_MODEL", "GEMINI_BASE_URL"],
  claude: ["LLM_PROVIDER", "CLAUDE_API_KEY", "CLAUDE_MODEL", "CLAUDE_BASE_URL", "CLAUDE_MAX_TOKENS"],
  zai: ["LLM_PROVIDER", "ZAI_API_KEY", "ZAI_MODEL", "ZAI_BASE_URL"],
}

const SUPPORTED_LIVE_PROVIDERS = Object.freeze(Object.keys(LIVE_PROVIDER_ENV))
const LIVE_ALLOWLIST_ENV = ["ALLOWLIST_BASE_URL", "ALLOWLIST_SALT"]
const LIVE_ONBOARDING_ENV = ["ONBOARDING_REPO_URL"]

function readRequiredTestEnv(names, env = process.env) {
  const values = {}
  const missing = []

  for (const name of names) {
    const value = env[name]?.trim()

    if (!value) {
      missing.push(name)
      continue
    }

    values[name] = value
  }

  if (missing.length > 0) {
    return { ok: false, values, missing }
  }

  return { ok: true, values, missing: [] }
}

function describeMissingTestEnv(names) {
  return `Для live-проверки не хватает переменных окружения: ${names.join(", ")}`
}

function readLiveProviderEnv(provider, env = process.env) {
  return readRequiredTestEnv(LIVE_PROVIDER_ENV[provider], env)
}

function resolveLiveProvider(env = process.env) {
  const provider = env.LLM_PROVIDER?.trim()

  if (!provider) {
    return {
      ok: false,
      missing: ["LLM_PROVIDER"],
      message: describeMissingTestEnv(["LLM_PROVIDER"]),
    }
  }

  if (!Object.hasOwn(LIVE_PROVIDER_ENV, provider)) {
    return {
      ok: false,
      missing: [],
      message: `Неподдерживаемый LLM_PROVIDER: ${provider}. Поддерживаются: ${SUPPORTED_LIVE_PROVIDERS.join(", ")}.`,
    }
  }

  return {
    ok: true,
    provider,
  }
}

function runLiveProviderPreflight(env = process.env) {
  const providerResult = resolveLiveProvider(env)

  if (!providerResult.ok) {
    return {
      checkedEnv: ["LLM_PROVIDER"],
      exitCode: 1,
      lines: [
        "Provider/live preflight: not ready.",
        providerResult.message,
        "Реальные provider-вызовы не выполнялись.",
      ],
      missing: providerResult.missing,
      ok: false,
    }
  }

  const checkedEnv = LIVE_PROVIDER_ENV[providerResult.provider]
  const envResult = readLiveProviderEnv(providerResult.provider, env)

  if (!envResult.ok) {
    return {
      checkedEnv,
      exitCode: 1,
      lines: [
        "Provider/live preflight: not ready.",
        `Активный provider: ${providerResult.provider}.`,
        describeMissingTestEnv(envResult.missing),
        `Проверены переменные: ${checkedEnv.join(", ")}`,
        "Реальные provider-вызовы не выполнялись.",
      ],
      missing: envResult.missing,
      ok: false,
      provider: providerResult.provider,
    }
  }

  return {
    checkedEnv,
    exitCode: 0,
    lines: [
      "Provider/live preflight: ready.",
      `Активный provider: ${providerResult.provider}.`,
      `Проверены переменные: ${checkedEnv.join(", ")}`,
      "Реальные provider-вызовы не выполнялись.",
    ],
    missing: [],
    ok: true,
    provider: providerResult.provider,
  }
}

function executeLiveProviderPreflight() {
  const result = runLiveProviderPreflight(process.env)

  for (const line of result.lines) {
    console.log(line)
  }

  process.exit(result.exitCode)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  executeLiveProviderPreflight()
}

export {
  LIVE_ALLOWLIST_ENV,
  LIVE_ONBOARDING_ENV,
  LIVE_PROVIDER_ENV,
  SUPPORTED_LIVE_PROVIDERS,
  describeMissingTestEnv,
  executeLiveProviderPreflight,
  readLiveProviderEnv,
  readRequiredTestEnv,
  resolveLiveProvider,
  runLiveProviderPreflight,
}
