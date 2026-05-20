// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Система выполняет start"
// @openSpec  - "Система выполняет iterate"
// @openSpec  - "В каталоге лаборатории остался legacy-конфиг"
// @openSpec  - "Система выполняет start для уровня"
// @openSpec  - "Система выполняет iterate prompt lookup для уровня"
// @openSpec  - "Система выполняет checking prompt lookup для уровня"
// @openSpec  - "Hidden prompt проверки уровня отсутствует"
// @openSpec  - "Runtime знает идентификатор уровня"
// @openSpec  - "Пользователь просматривает историю итераций"
// @openSpec capability: onboarding-repo
// @openSpec scenarios:
// @openSpec  - "Автор onboarding-уровня добавляет prompt проверки"
// @openSpec  - "Автор onboarding-уровня не добавляет prompt проверки"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("LLM flow source contracts", () => {
  it("start-flow использует общий production prompt, didactic default и level-specific start/iterate prompts", () => {
    const source = readProjectFile("lib", "task", "actions.ts")

    expect(source).toContain('readPrompt("production", "start-component")')
    expect(source).toContain('readPrompt("didactic", "default")')
    expect(source).toContain("readLevelIteratePrompt(level.id)")
    expect(source).toContain("readLevelStartPrompt(level.id)")
    expect(source).toContain('target: "init"')
    expect(source).toContain("imageBase64List")
  })

  it("iterate-flow использует общий production prompt, didactic default и level-specific iterate prompt", () => {
    const source = readProjectFile("lib", "task", "actions.ts")

    expect(source).toContain('readPrompt("production", "default")')
    expect(source).toContain('readPrompt("production", "iterate-component")')
    expect(source).toContain('readPrompt("didactic", "default")')
    expect(source).toContain("readLevelIteratePrompt(level.id)")
    expect(source).toContain("runStructuredLlmRequest({")
    expect(source).toContain("imageBase64List")
  })

  it("prompt lookup строит hidden level prompt path только по levelId", () => {
    const source = readProjectFile("lib", "prompt", "server.ts")

    expect(source).toContain('path.join("levels", levelId, "start")')
    expect(source).toContain('path.join("levels", levelId, "iterate")')
    expect(source).toContain('path.join("levels", levelId, "check")')
    expect(source).toContain('.njk')
    expect(source).not.toContain("promptKey")
  })

  it("check-flow использует optional hidden check prompt уровня", () => {
    const promptServer = readProjectFile("lib", "prompt", "server.ts")
    const checkRoute = readProjectFile("lib", "task", "actions.ts")
    const checkPromptFunction = promptServer.match(/export async function readLevelCheckPrompt[\s\S]*?\n}/)?.[0] ?? ""

    expect(checkRoute).toContain("readLevelCheckPrompt(level.id)")
    expect(checkRoute).toContain('readPrompt("production", "default")')
    expect(checkRoute).toContain('readPrompt("didactic", "default")')
    expect(checkRoute).toContain("${levelCheckPrompt}")
    expect(checkRoute).toContain('target: "check"')
    expect(checkPromptFunction).toContain('return ""')
    expect(checkPromptFunction).not.toContain("Промпт проверки уровня не найден")
  })

  it("system status предупреждает о legacy-конфиге без использования его как fallback", () => {
    const source = readProjectFile("lib", "system", "resources", "internalstate.ts")
    const sourceSections = readProjectFile("lib", "system", "resources", "internalstate-sections.ts")
    const resourceContent = readProjectFile("lib", "system", "resources", "content.json")
    const localConfig = readProjectFile("lib", "system", "config", "local.cjs")

    expect(source).toContain("localConfigState.hasLegacyEnv")
    expect(source).toContain("getLocalConfigCondition(localConfigState)")
    expect(sourceSections).toContain('args.resources.add("local-config-file", args.localConfigCondition)')
    expect(resourceContent).toContain("Обнаружен устаревший")
    expect(resourceContent).toContain(".env.local")
    expect(resourceContent).toContain("Старый `.env.local` создаёт двусмысленность")
    expect(localConfig).toContain('const LOCAL_CONFIG_FILENAME = "desengine.config.txt"')
    expect(localConfig).toContain('const LEGACY_LOCAL_ENV_FILENAME = ".env.local"')
    expect(localConfig).not.toContain("readLocalConfig(getLegacyLocalEnvPath")
  })

  it("история итераций хранит учебную стоимость отдельно от provider metrics", () => {
    const iterateRoute = readProjectFile("lib", "task", "actions.ts")
    const repository = readProjectFile("lib", "onboarding", "repository.ts")

    expect(iterateRoute).toContain("teachingCostCents: TEACHING_COST_PER_ITERATION_CENTS")
    expect(iterateRoute).toContain("metrics: llmCall.metrics")
    expect(repository).toContain("callsWithoutProviderMetrics")
    expect(repository).toContain("teachingCostCents: promptHistory.length * TEACHING_COST_PER_ITERATION_CENTS")
  })
})
