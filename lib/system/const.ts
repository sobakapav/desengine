/** Системные константы и списки констант
  * 
  * В основном нужны для настройки типов.
  */

/** Статусы пользовательской авторизации */
const AUTH_STATES = [
  "valid",
  "missing",
  "expired",
] as const

/** Статусы системных ресурсов */
const RESOURCE_STATES = [
  "ready",
  "warning",
  "blocked",
] as const

/** ID ресурсов системы */
const RESOURCE_IDS = [
  "local-config-file",
  "llm-config",
  "llm-network",
  "allowlist-config",
  "allowlist-network",
  "access-session",
  "system-release",
  "onboarding-config",
  "onboarding-content",
] as const

/** Роли пользователей в системе */
const USER_ROLES = [
  "user",
  "admin",
] as const

/** ID LLM-провайдеров, к которым система может подключиться */
const LLM_PROVIDER_IDS = [
  "openai",
  "deepseek",
  "gemini",
] as const


export {
  AUTH_STATES,
  RESOURCE_STATES,
  RESOURCE_IDS,
  USER_ROLES,
  LLM_PROVIDER_IDS,
}
