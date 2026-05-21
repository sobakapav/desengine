// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик создаёт child change для другого исполнителя"
// @openSpec  - "Разработчик пытается начать implement/fix без заполненного handoff"

import { execFileSync } from "node:child_process"
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
})
