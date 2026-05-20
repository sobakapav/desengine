import { createRequire } from "node:module"
import { createCheck, getNodeVersionStatus, runBuildCheck } from "./smoke-local-install/checks.mjs"
import { createLlmChecks } from "./smoke-local-install/llm-checks.mjs"
import { ensureOnboardingReady } from "./smoke-local-install/onboarding.mjs"

const require = createRequire(import.meta.url)
const { getLocalConfigPath, getLocalConfigState, readLocalConfig } = require("../lib/local-config.cjs")
const rootDir = process.cwd()
// Контракт smoke-flow остаётся в этом CLI entry point: ensureOnboardingReady читает ONBOARDING_REPO_URL
// и запускает repairToolPath через соседний модуль без изменения команды `npm run smoke`.

function createConfigChecks(localConfigState) {
  return [
    createCheck(
      "env-file",
      localConfigState.hasConfig,
      localConfigState.hasConfig ? "Файл desengine.config.txt найден" : "Файл desengine.config.txt не найден",
      localConfigState.hasConfig
        ? "Локальная конфигурация присутствует."
        : "Создайте `desengine.config.txt` на основе `desengine.config-example.txt`.",
    ),
    createCheck(
      "legacy-env-file",
      !localConfigState.hasLegacyEnv,
      localConfigState.hasLegacyEnv ? "Обнаружен устаревший файл .env.local" : "Устаревший .env.local не найден",
      localConfigState.hasLegacyEnv
        ? "Перенесите значения в `desengine.config.txt` и удалите `.env.local`, иначе настройки будут двусмысленными."
        : "Локальная конфигурация использует только `desengine.config.txt`.",
    ),
  ]
}

function createAllowlistCheck(env) {
  const allowlistConfigured = Boolean(env.ALLOWLIST_BASE_URL && env.ALLOWLIST_SALT)

  return createCheck(
    "allowlist-config",
    allowlistConfigured,
    allowlistConfigured ? "Allowlist настроен" : "Allowlist не настроен",
    allowlistConfigured
      ? "Пользователь сможет пройти допуск по email из allowlist."
      : "Без allowlist пользователь увидит страницу состояния, но не сможет войти в лабораторию.",
  )
}

function printReport(checks) {
  console.log("desengine smoke-check")
  console.log("")

  for (const check of checks) {
    console.log(`${check.ok ? "OK " : "NO "} ${check.summary}`)
    console.log(`   ${check.detail}`)
  }

  console.log("")
}

async function main() {
  const localConfigState = getLocalConfigState(rootDir)
  const fileEnv = readLocalConfig(getLocalConfigPath(rootDir))
  const env = { ...fileEnv, ...process.env }
  const nodeStatus = getNodeVersionStatus()
  const checks = [
    createCheck("node", nodeStatus.ok, nodeStatus.summary, nodeStatus.detail),
    ...createConfigChecks(localConfigState),
    ...createLlmChecks(env),
    createAllowlistCheck(env),
    await ensureOnboardingReady(rootDir, env),
    await runBuildCheck(rootDir),
  ]

  printReport(checks)

  if (checks.every((check) => check.ok)) {
    console.log("Итог: локальная установка выглядит готовой к внешнему запуску.")
    return
  }

  console.log("Итог: локальная установка ещё не готова.")
  process.exitCode = 1
}

await main()
