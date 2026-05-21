// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Разработчик запускает быстрый локальный тестовый слой"
// @openSpec  - "Разработчик запускает полный локальный тестовый слой"
// @openSpec  - "Разработчик запускает проверки по capability"
// @openSpec  - "Тестовый файл покрывает OpenSpec-сценарий"
// @openSpec  - "Capability временно не имеет полного покрытия"
// @openSpec  - "Добавляется capability с quality-правилами читаемости"
// @openSpec  - "Credentials не заданы"
// @openSpec  - "Разработчик запускает live/provider-проверку"
// @openSpec  - "Тестовый слой ещё покрывает не все specs"
// @openSpec  - "Добавляется новый behavior-change"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("change testing guidance", () => {
  it("package scripts задают быстрый, полный, выборочный и live/provider тестовые entry point'ы", () => {
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts: Record<string, string>
    }

    expect(packageJson.scripts.test).toBe("npm run test:unit")
    expect(packageJson.scripts["test:unit"]).toBe("vitest run --project unit")
    expect(packageJson.scripts["quality:text"]).toBe("node tools/quality-text/engine.mjs --scope=working")
    expect(packageJson.scripts["quality:text:branch"]).toBe("node tools/quality-text/engine.mjs --scope=branch")
    expect(packageJson.scripts["quality:text:repo"]).toBe("node tools/quality-text/engine.mjs --scope=repo")
    expect(packageJson.scripts["test:readability"]).toBe("npm run quality:text")
    expect(packageJson.scripts["test:readability:branch"]).toBe("npm run quality:text:branch")
    expect(packageJson.scripts["test:readability:repo"]).toBe("npm run quality:text:repo")
    expect(packageJson.scripts["test:full"]).toBe(
      "npm run test:unit && npm run test:traceability && npm run quality:text",
    )
    expect(packageJson.scripts["test:spec"]).toBe("node tools/testing/pending-layer.mjs spec")
    expect(packageJson.scripts["test:live"]).toBe("node tools/testing/pending-layer.mjs live")
    expect(packageJson.scripts.os).toBe("node tools/list-active-openspec-changes.mjs")
    expect(packageJson.scripts["os:p"]).toBe("node tools/list-openspec-producers.mjs")
    expect(packageJson.scripts["os:tree"]).toBeUndefined()
    expect(packageJson.scripts["test:full"]).not.toContain("test:live")
  })

  it("traceability checker валидирует OpenSpec metadata и требует coverage-plan для неполного покрытия", () => {
    const source = readProjectFile("tools", "testing", "check-openspec-traceability.mjs")

    expect(source).toContain("CAPABILITY_PATTERN")
    expect(source).toContain("SCENARIO_ITEM_PATTERN")
    expect(source).toContain("validateShortRules")
    expect(source).toContain("validateChangeKindRules")
    expect(source).toContain("CHANGE_KIND_PATTERN")
    expect(source).toContain("focus")
    expect(source).toContain("execution_mode")
    expect(source).toContain("parent_change")
    expect(source).toContain("roadmap_ref")
    expect(source).toContain("roadmap_refs")
    expect(source).toContain("producer_ref")
    expect(source).toContain("суффикс даты в имени change не допускается")
    expect(source).toContain("должно начинаться с маленькой буквы")
    expect(source).toContain("должно быть не длиннее 75 символов")
    expect(source).toContain("не должно заканчиваться знаком препинания")
    expect(source).toContain("coverage-plan")
    expect(source).toContain("ссылается на неизвестный capability")
    expect(source).toContain("ссылается на неизвестный scenario")
    expect(source).toContain("но capability не внесён в coverage-plan")
  })

  it("readability checker задаёт deterministic-правила читаемости для изменённых файлов", () => {
    const source = readProjectFile("tools", "quality-text", "engine.mjs")
    const config = JSON.parse(readProjectFile("tools", "quality-text", "config.json")) as {
      maxLinesProduction: number
      maxLinesTests: number
      maxFunctionLines: number
      scopes: string[]
      llm: { mode: string; maxFiles: number; maxTokens: number; fallback: string }
    }
    const packageJson = JSON.parse(readProjectFile("package.json")) as {
      scripts: Record<string, string>
    }
    const ruleFiles = [
      "file-length.mjs",
      "function-length.mjs",
      "todo-format.mjs",
      "boolean-trap.mjs",
      "floating-promise.mjs",
      "api-example.mjs",
    ]

    expect(source).toContain("maxLinesProduction: 300")
    expect(source).toContain("maxLinesTests: 450")
    expect(source).toContain("maxFunctionLines: 60")
    expect(source).toContain("qualityTextRules")
    expect(source).toContain("qualityTextRuleIds")
    expect(source).toContain('const scope = args.scope ?? config.scopes[0] ?? "working"')
    expect(source).toContain('if (scope === "repo")')
    expect(source).toContain('if (scope === "branch")')

    for (const ruleFile of ruleFiles) {
      expect(fs.existsSync(path.join(process.cwd(), "tools", "quality-text", "rules", ruleFile))).toBe(true)
    }

    expect(readProjectFile("tools", "quality-text", "rules", "todo-format.mjs")).toContain("TODO(owner:")
    expect(readProjectFile("tools", "quality-text", "rules", "todo-format.mjs")).toContain("targetStage:")
    expect(readProjectFile("tools", "quality-text", "rules", "boolean-trap.mjs")).toContain("boolean-trap")
    expect(readProjectFile("tools", "quality-text", "rules", "floating-promise.mjs")).toContain("floating-promise")

    expect(config.maxLinesProduction).toBe(300)
    expect(config.maxLinesTests).toBe(450)
    expect(config.maxFunctionLines).toBe(60)
    expect(config.scopes).toEqual(["working", "branch", "repo"])
    expect(config.llm).toEqual({ mode: "off", maxFiles: 5, maxTokens: 8000, fallback: "deterministic" })
    expect(packageJson.scripts["quality:text"]).not.toContain("QUALITY_TEXT_LLM_MODE")
    expect(packageJson.scripts["quality:text"]).not.toContain("--llm=optional")
    expect(packageJson.scripts["quality:text:branch"]).not.toContain("QUALITY_TEXT_LLM_MODE")
    expect(packageJson.scripts["quality:text:repo"]).not.toContain("--llm=optional")
    expect(packageJson.scripts["test:full"]).not.toContain("QUALITY_TEXT_LLM_MODE")
    expect(packageJson.scripts["test:full"]).not.toContain("--llm=optional")
  })

  it("placeholder-команды не блокируют runtime и объясняют следующий этап", () => {
    const source = readProjectFile("tools", "testing", "pending-layer.mjs")

    expect(source).toContain("integration")
    expect(source).toContain("live")
    expect(source).toContain("spec")
    expect(source).toContain("слой ещё не реализован")
    expect(source).toContain("Сейчас этот placeholder завершается успешно")
  })

  it("AGENTS.md требует тестовую часть для behavior-change", () => {
    const source = readProjectFile("AGENTS.md")

    expect(source).toContain("Тестовая часть behavior-change обязательна")
    expect(source).toContain("затронутые OpenSpec capability/scenarios")
    expect(source).toContain("команду запуска")
    expect(source).toContain("mock/fixture-данные")
    expect(source).toContain("test/traceability/coverage-plan.json")
  })

  it("генератор OpenSpec change добавляет тестовый чеклист в tasks.md", () => {
    const source = readProjectFile("tools", "create-openspec-change.mjs")
    const nameSource = readProjectFile("tools", "openspec-change-name.mjs")
    const handoffSource = readProjectFile("tools", "openspec-handoff.mjs")

    expect(source).toContain("TEST_CHECKLIST_HEADING")
    expect(source).toContain("## Тестовая часть change")
    expect(source).toContain("METADATA_DEFAULTS")
    expect(source).toContain("short_policy")
    expect(source).toContain("review_sync_state")
    expect(source).toContain("change_kind")
    expect(source).toContain("GOVERNED_PREFIXES")
    expect(source).toContain("focus")
    expect(source).toContain("execution_mode")
    expect(source).toContain("parent_change")
    expect(source).toContain("strategy_root")
    expect(source).toContain("roadmap_ref")
    expect(source).toContain("roadmap_refs")
    expect(source).toContain("producer_ref")
    expect(source).toContain('"none"')
    expect(source).toContain("краткое описание change")
    expect(source).toContain("normalizeShortValue")
    expect(source).toContain("normalizeCreatedChangeName")
    expect(source).toContain("Имя change нормализовано")
    expect(source).toContain("кратко ")
    expect(source).toContain("ensureTestChecklist(changeDir)")
    expect(source).toContain("ensureHandoffFile")
    expect(source).toContain("test/traceability/coverage-plan.json")
    expect(source).toContain("Обновлены поля metadata")
    expect(nameSource).toContain("assertValidChangeName")
    expect(nameSource).toContain("суффикс даты в имени change не допускается")
    expect(handoffSource).toContain("HANDOFF_FILE")
    expect(handoffSource).toContain("## Миссия")
    expect(handoffSource).toContain("[заполнить]")
  })

  it("документация показывает пример тестовой части и правило coverage-plan", () => {
    const source = readProjectFile("docs", "testing-layer.md")

    expect(source).toContain("## Тестовая часть change")
    expect(source).toContain("Минимальный пример")
    expect(source).toContain("Выбор уровня")
    expect(source).toContain("live/provider")
    expect(source).toContain("Если полный тест сейчас нельзя добавить")
    expect(source).toContain("targetStage")
    expect(source).toContain("quality:text")
  })

  it("документация admin-tools использует npm run os как основной tree-listing", () => {
    const source = readProjectFile("tools", "README.md")

    expect(source).toContain("### `npm run os`")
    expect(source).toContain("### `npm run os:short`")
    expect(source).toContain("### `npm run os:p`")
    expect(source).toContain("🩸")
    expect(source).toContain("🍀")
    expect(source).toContain("npm run os -- dispatcher")
    expect(source).toContain("ярко-белым ANSI-цветом")
    expect(source).toContain("implement/fix changes по producer")
    expect(source).toContain("скрывает исполнительские changes")
    expect(source).not.toContain("### `npm run os:tree`")
  })
})
