// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик создаёт child change для другого исполнителя"
// @openSpec  - "Разработчик пытается начать implement/fix без заполненного handoff"
// @openSpec  - "Разработчик пытается начать неисполнительский change"
// @openSpec  - "Разработчик начинает implement/fix change"

import { execFileSync, spawnSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { buildHandoffTemplate, ensureHandoffFile, getHandoffReadiness } from "../../tools/openspec-handoff.mjs"

const tempDirs: string[] = []

describe("openspec handoff", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("создаёт handoff-шаблон с обязательными секциями", () => {
    const template = buildHandoffTemplate({
      changeName: "implement-demo",
      summary: "подготовить демонстрационный change",
      parentChange: "dispatcher-demo",
      strategyRoot: "focus-demo",
      verificationLevel: "unit",
      verificationCommand: "npm run test:unit",
    })

    expect(template).toContain("## Миссия")
    expect(template).toContain("## Унаследованный контекст")
    expect(template).toContain("## Обязательные источники")
    expect(template).toContain("## Границы исполнения")
    expect(template).toContain("## Проверка результата")
    expect(template).toContain("## Открытые вопросы")
    expect(template).toContain("dispatcher-demo")
    expect(template).toContain("Кто отвечает за стратегию, тактику и приёмку результата")
    expect(template).toContain("не пересматривает решения родительских changes")
    expect(template).toContain("[заполнить]")
  })

  it("считает handoff неготовым, пока в нём остались плейсхолдеры", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-handoff-"))
    tempDirs.push(fixtureRoot)
    const changeDir = path.join(fixtureRoot, "openspec", "changes", "implement-demo")

    fs.mkdirSync(changeDir, { recursive: true })
    ensureHandoffFile(changeDir, {
      changeName: "implement-demo",
      summary: "подготовить демонстрационный change",
      parentChange: "dispatcher-demo",
      strategyRoot: "focus-demo",
      verificationLevel: "unit",
      verificationCommand: "npm run test:unit",
    })

    const readiness = getHandoffReadiness(changeDir)

    expect(readiness.ready).toBe(false)
    expect(readiness.errors.join("\n")).toContain("плейсхолдеры")
  })

  it("считает handoff готовым после содержательного заполнения всех секций", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-handoff-ready-"))
    tempDirs.push(fixtureRoot)
    const changeDir = path.join(fixtureRoot, "openspec", "changes", "implement-demo")

    fs.mkdirSync(changeDir, { recursive: true })
    fs.writeFileSync(
      path.join(changeDir, "handoff.md"),
      `## Миссия

- Подготовить конкретное изменение task-runtime и не дублировать исследование dispatcher.

## Унаследованный контекст

- parent_change: dispatcher-demo
- strategy_root: focus-demo
- release_ref: (не задан)
- В dispatcher уже определены целевой runtime boundary и список затронутых сценариев.

## Обязательные источники

- openspec/changes/dispatcher-demo/proposal.md
- openspec/changes/dispatcher-demo/design.md
- openspec/changes/dispatcher-demo/tasks.md
- test/unit/task-runtime.test.ts

## Границы исполнения

- Входит: runtime boundary и unit-покрытие.
- Не входит: UI и новые capabilities.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Нужно доказать, что boundary не ломает существующие сценарии dispatcher.

## Открытые вопросы

- Уточнить, нужен ли отдельный traceability-апдейт для capability task-runtime.
`,
      "utf8",
    )

    const readiness = getHandoffReadiness(changeDir)

    expect(readiness.ready).toBe(true)
    expect(readiness.errors).toEqual([])
  })

  it("os:begin блокирует implement без готового handoff", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-begin-handoff-"))
    tempDirs.push(fixtureRoot)
    const changeDir = path.join(fixtureRoot, "openspec", "changes", "implement-demo")

    fs.mkdirSync(changeDir, { recursive: true })
    fs.writeFileSync(
      path.join(changeDir, ".openspec.yaml"),
      `change_kind: "implement"
execution_mode: "code"
parent_change: "dispatcher-demo"
strategy_root: "focus-demo"
verification_level: "unit"
verification_command: "npm run test:unit"
`,
      "utf8",
    )
    ensureHandoffFile(changeDir, {
      changeName: "implement-demo",
      summary: "подготовить демонстрационный change",
      parentChange: "dispatcher-demo",
      strategyRoot: "focus-demo",
      verificationLevel: "unit",
      verificationCommand: "npm run test:unit",
    })

    expect(() =>
      execFileSync(process.execPath, [path.join(process.cwd(), "tools", "openspec-begin-change.mjs"), "implement-demo"], {
        cwd: fixtureRoot,
        encoding: "utf8",
        stdio: "pipe",
      }),
    ).toThrow(/handoff/)
  })

  it("os:begin для dispatcher явно запрещает код и требует породить implement/fix", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-begin-dispatcher-"))
    tempDirs.push(fixtureRoot)
    const changeDir = path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo")

    fs.mkdirSync(changeDir, { recursive: true })
    fs.writeFileSync(
      path.join(changeDir, ".openspec.yaml"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "focus-demo"
strategy_root: "focus-demo"
roadmap_ref: "focus-demo/roadmaps/demo.md"
`,
      "utf8",
    )

    const result = spawnSync(process.execPath, [path.join(process.cwd(), "tools", "openspec-begin-change.mjs"), "dispatcher-demo"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    const output = `${result.stdout}\n${result.stderr}`
    expect(output).toContain("Прямое изменение кода здесь запрещено. Код меняют только implement/fix.")
    expect(output).toContain("Dispatcher обязан создавать implement/fix changes")
    expect(output).toContain("Создать implement/fix change и связать его с dispatcher-demo")
  })

  it("os:begin для producer явно отправляет delivery в dispatcher", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-begin-producer-"))
    tempDirs.push(fixtureRoot)
    const changeDir = path.join(fixtureRoot, "openspec", "changes", "producer-demo")

    fs.mkdirSync(changeDir, { recursive: true })
    fs.writeFileSync(
      path.join(changeDir, ".openspec.yaml"),
      `change_kind: "producer"
execution_mode: "no-code"
parent_change: "focus-demo"
strategy_root: "focus-demo"
`,
      "utf8",
    )

    const output = execFileSync(process.execPath, [path.join(process.cwd(), "tools", "openspec-begin-change.mjs"), "producer-demo"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    expect(output).toContain("Прямое изменение кода здесь запрещено. Код меняют только implement/fix.")
    expect(output).toContain("Producer формирует roadmap и ожидания, но не создаёт код напрямую.")
    expect(output).toContain("Producer обязан работать через downstream dispatcher changes")
  })

  it("os:begin для release явно запрещает прямой код и отправляет в os:dispatch", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-begin-release-"))
    tempDirs.push(fixtureRoot)
    const releaseDir = path.join(fixtureRoot, "openspec", "changes", "release-demo")
    const implementDir = path.join(fixtureRoot, "openspec", "changes", "implement-demo")

    fs.mkdirSync(releaseDir, { recursive: true })
    fs.mkdirSync(implementDir, { recursive: true })
    fs.writeFileSync(
      path.join(releaseDir, ".openspec.yaml"),
      `change_kind: "release"
execution_mode: "no-code"
`,
      "utf8",
    )
    fs.writeFileSync(
      path.join(implementDir, ".openspec.yaml"),
      `change_kind: "implement"
execution_mode: "code"
parent_change: "dispatcher-demo"
strategy_root: "focus-demo"
release_ref: "release-demo"
verification_level: "unit"
verification_command: "npm run test:unit"
`,
      "utf8",
    )

    const output = execFileSync(process.execPath, [path.join(process.cwd(), "tools", "openspec-begin-change.mjs"), "release-demo"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    expect(output).toContain("Прямое изменение кода здесь запрещено. Код меняют только implement/fix.")
    expect(output).toContain("Release управляет delivery implement/fix через os:dispatch")
    expect(output).toContain("Следующий шаг для новой хотелки из release-контекста:")
    expect(output).toContain("npm run os:dispatch -- release-demo --dispatcher <dispatcher-change> --kind fix --name <name> --description")
  })

  it("os:begin для готового implement напоминает границы роли и приёмку родителя", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-begin-implement-ready-"))
    tempDirs.push(fixtureRoot)
    const changeDir = path.join(fixtureRoot, "openspec", "changes", "implement-demo")

    fs.mkdirSync(changeDir, { recursive: true })
    fs.writeFileSync(
      path.join(changeDir, ".openspec.yaml"),
      `change_kind: "implement"
execution_mode: "code"
parent_change: "dispatcher-demo"
strategy_root: "focus-demo"
verification_level: "unit"
verification_command: "npm run test:unit"
`,
      "utf8",
    )
    fs.writeFileSync(
      path.join(changeDir, "handoff.md"),
      `## Миссия

- Изменить только исполнительский код и не переоткрывать решения родителей.

## Унаследованный контекст

- parent_change: dispatcher-demo
- strategy_root: focus-demo
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: границы реализации и сценарии.
- Кто отвечает за стратегию, тактику и приёмку результата: dispatcher-demo и focus-demo.

## Обязательные источники

- openspec/changes/dispatcher-demo/proposal.md
- openspec/changes/dispatcher-demo/design.md
- openspec/changes/dispatcher-demo/tasks.md
- test/unit/demo.test.ts

## Границы исполнения

- Что входит в этот change: исполнительский код и unit-проверки.
- Что сознательно не входит в этот change: пересмотр стратегии, тактики и roadmap.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: тактика, приёмка и roadmap.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: реализация не ломает сценарии dispatcher.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: уточнить edge cases.
`,
      "utf8",
    )

    const output = execFileSync(process.execPath, [path.join(process.cwd(), "tools", "openspec-begin-change.mjs"), "implement-demo"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    expect(output).toContain("код меняется только в implement/fix; стратегия и тактика уже заданы предками")
    expect(output).toContain("parent dispatcher отвечает за постановку и приёмку результата")
  })
})
