import { createRequire } from "node:module"

import { runRealOnboardingSmoke } from "./smoke-local-install/onboarding.mjs"

const require = createRequire(import.meta.url)
const { getLocalConfigPath, readLocalConfig } = require("../lib/system/config/local.cjs")

const rootDir = process.cwd()

function printReport(result) {
  console.log("desengine real-onboarding smoke")
  console.log("")
  console.log("Контракт: реальный `/onboarding` checkout должен быть совместим с runtime и smoke/tooling.")
  console.log("Unit-фикстуры в этой команде не используются.")
  console.log("")
  console.log(`${result.ok ? "OK " : "NO "} ${result.summary}`)
  console.log(`   ${result.detail}`)
  console.log("")
}

async function main() {
  const fileEnv = readLocalConfig(getLocalConfigPath(rootDir))
  const env = { ...fileEnv, ...process.env }
  const result = await runRealOnboardingSmoke(rootDir, env)

  printReport(result)

  if (result.ok) {
    console.log("Итог: реальный onboarding checkout подтверждён для внешней проверки.")
    return
  }

  console.log("Итог: реальный onboarding checkout не подтверждён.")
  process.exitCode = 1
}

await main()
