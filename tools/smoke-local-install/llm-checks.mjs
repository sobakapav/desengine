import { createCheck } from "./checks.mjs"

const PROVIDER_FIELDS = {
  deepseek: ["DEEPSEEK_API_KEY", "DEEPSEEK_MODEL", "DEEPSEEK_BASE_URL"],
  gemini: ["GEMINI_API_KEY", "GEMINI_MODEL", "GEMINI_BASE_URL"],
  openai: ["OPENAI_API_KEY", "OPENAI_MODEL", "OPENAI_BASE_URL"],
}

function getActiveProvider(env) {
  return (env.LLM_PROVIDER || "openai").trim().toLowerCase()
}

function getActiveProviderFields(env) {
  return PROVIDER_FIELDS[getActiveProvider(env)] ?? PROVIDER_FIELDS.openai
}

function createProviderPresenceCheck(env) {
  return createCheck(
    "llm-provider",
    Boolean(env.LLM_PROVIDER || env.OPENAI_API_KEY),
    env.LLM_PROVIDER ? `Активный LLM-провайдер: ${env.LLM_PROVIDER}` : "Активный LLM-провайдер не задан",
    env.LLM_PROVIDER
      ? "Проверьте, что для этого провайдера заданы ключ, модель и базовый URL."
      : "Задайте `LLM_PROVIDER` в `desengine.config.txt`.",
  )
}

function createProviderFieldCheck(id, env, fieldIndex, readySummary, missingSummary, readyDetail, missingDetail) {
  const activeProvider = getActiveProvider(env)
  const fieldName = getActiveProviderFields(env)[fieldIndex]
  const hasValue = Boolean(env[fieldName])

  return createCheck(
    id,
    hasValue,
    hasValue ? readySummary(activeProvider) : missingSummary(activeProvider),
    hasValue ? readyDetail : missingDetail(activeProvider),
  )
}

export function createLlmChecks(env) {
  return [
    createProviderPresenceCheck(env),
    createProviderFieldCheck(
      "llm-credentials",
      env,
      0,
      (provider) => `Ключ активного провайдера ${provider} задан`,
      (provider) => `Ключ активного провайдера ${provider} не задан`,
      "LLM-конфигурация может работать после сетевой проверки.",
      (provider) => `Без ключа для активного провайдера ${provider} откроется только страница состояния, а LLM-сценарии останутся недоступны.`,
    ),
    createProviderFieldCheck(
      "llm-model",
      env,
      1,
      (provider) => `Модель активного провайдера ${provider} задана`,
      (provider) => `Модель активного провайдера ${provider} не задана`,
      "Обе точки входа `start` и `iterate` смогут использовать одну и ту же модель.",
      (provider) => `Задайте модель для активного провайдера ${provider} в desengine.config.txt.`,
    ),
    createProviderFieldCheck(
      "llm-base-url",
      env,
      2,
      (provider) => `BASE_URL активного провайдера ${provider} задан`,
      (provider) => `BASE_URL активного провайдера ${provider} не задан`,
      "Сетевой endpoint активного провайдера задан явно.",
      (provider) => `Задайте BASE_URL для активного провайдера ${provider} в desengine.config.txt.`,
    ),
  ]
}
