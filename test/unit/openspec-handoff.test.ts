// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик создаёт child change для другого исполнителя"
// @openSpec  - "Разработчик пытается начать implement/fix без заполненного handoff"
// @openSpec  - "Разработчик пытается начать неисполнительский change"
// @openSpec  - "Разработчик начинает implement/fix change"
// @openSpec  - "Release-диспетчеризация новой хотелки"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { buildHandoffTemplate, ensureHandoffFile, getHandoffReadiness } from "../../tools/openspec-handoff.mjs"
import { runOpenSpecBegin } from "../../tools/openspec-begin-change.mjs"
import { runOpenSpecDispatch } from "../../tools/openspec-dispatch-change.mjs"

const tempDirs: string[] = []

class ExitSignal extends Error {
  code: number | undefined

  constructor(code: number | undefined) {
    super(`process.exit(${code})`)
    this.code = code
  }
}

function runToolInFixture(args: {
  cwd: string
  argv: string[]
  runner: (argv: string[]) => void
  env?: Record<string, string | undefined>
}) {
  const stdout: string[] = []
  const stderr: string[] = []
  const originalCwd = process.cwd()
  const originalLog = console.log
  const originalError = console.error
  const originalExit = process.exit
  const originalEnv = { ...process.env }
  let exitCode: number | undefined
  let thrown: unknown

  console.log = (...values: unknown[]) => {
    stdout.push(values.map(String).join(" "))
  }
  console.error = (...values: unknown[]) => {
    stderr.push(values.map(String).join(" "))
  }
  process.exit = ((code?: number) => {
    throw new ExitSignal(code)
  }) as typeof process.exit

  if (args.env) {
    for (const [key, value] of Object.entries(args.env)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }

  try {
    process.chdir(args.cwd)
    args.runner(args.argv)
  } catch (error) {
    if (error instanceof ExitSignal) {
      exitCode = error.code
    } else {
      thrown = error
    }
  } finally {
    process.chdir(originalCwd)
    console.log = originalLog
    console.error = originalError
    process.exit = originalExit

    for (const key of Object.keys(process.env)) {
      if (!(key in originalEnv)) {
        delete process.env[key]
      }
    }
    for (const [key, value] of Object.entries(originalEnv)) {
      process.env[key] = value
    }
  }

  return {
    exitCode,
    stdout: stdout.join("\n"),
    stderr: stderr.join("\n"),
    thrown,
  }
}

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

    const result = runToolInFixture({
      cwd: fixtureRoot,
      argv: ["implement-demo"],
      runner: runOpenSpecBegin,
    })

    expect(result.exitCode).toBe(2)
    expect(result.stderr).toMatch(/handoff/)
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

    const result = runToolInFixture({
      cwd: fixtureRoot,
      argv: ["dispatcher-demo"],
      runner: runOpenSpecBegin,
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

    const result = runToolInFixture({
      cwd: fixtureRoot,
      argv: ["producer-demo"],
      runner: runOpenSpecBegin,
    })
    const output = `${result.stdout}\n${result.stderr}`

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

    const result = runToolInFixture({
      cwd: fixtureRoot,
      argv: ["release-demo"],
      runner: runOpenSpecBegin,
    })
    const output = `${result.stdout}\n${result.stderr}`

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

    const result = runToolInFixture({
      cwd: fixtureRoot,
      argv: ["implement-demo"],
      runner: runOpenSpecBegin,
    })
    const output = `${result.stdout}\n${result.stderr}`

    expect(output).toContain("код меняется только в implement/fix; стратегия и тактика уже заданы предками")
    expect(output).toContain("parent dispatcher отвечает за постановку и приёмку результата")
  })

  it("os:dispatch в release-режиме создаёт implement change вместе с handoff", { timeout: 15000 }, () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-dispatch-handoff-"))
    tempDirs.push(fixtureRoot)
    const binDir = path.join(fixtureRoot, "bin")
    const npmShimPath = path.join(binDir, "npm")
    const openspecShimPath = path.join(binDir, "openspec")
    const fixtureToolsDir = path.join(fixtureRoot, "tools")

    fs.mkdirSync(binDir, { recursive: true })
    fs.mkdirSync(fixtureToolsDir, { recursive: true })
    fs.symlinkSync(path.join(process.cwd(), "tools", "create-openspec-change.mjs"), path.join(fixtureToolsDir, "create-openspec-change.mjs"))
    fs.symlinkSync(path.join(process.cwd(), "tools", "openspec-change-name.mjs"), path.join(fixtureToolsDir, "openspec-change-name.mjs"))
    fs.symlinkSync(path.join(process.cwd(), "tools", "openspec-handoff.mjs"), path.join(fixtureToolsDir, "openspec-handoff.mjs"))

    fs.writeFileSync(
      npmShimPath,
      `#!/bin/sh
if [ "$1" = "run" ] && [ "$2" = "os:begin" ]; then
  shift 3
  exec ${process.execPath} ${path.join(process.cwd(), "tools", "openspec-begin-change.mjs")} "$@"
fi
echo "unsupported mock npm args: $*" >&2
exit 1
`,
      "utf8",
    )
    fs.chmodSync(npmShimPath, 0o755)
    fs.writeFileSync(
      openspecShimPath,
      `#!/bin/sh
if [ "$1" = "new" ] && [ "$2" = "change" ] && [ -n "$3" ]; then
  change_name="$3"
  change_dir="openspec/changes/$change_name"
  mkdir -p "$change_dir"
  cat > "$change_dir/.openspec.yaml" <<'EOF'
schema: spec-driven
created: 2026-05-24
EOF
  cat > "$change_dir/tasks.md" <<'EOF'
## Tasks

- [ ] 1. Уточнить постановку и границы реализации
- [ ] 2. Внести кодовые изменения
- [ ] 3. Выполнить проверку по verification_command из metadata
EOF
  exit 0
fi
echo "unsupported mock openspec args: $*" >&2
exit 1
`,
      "utf8",
    )
    fs.chmodSync(openspecShimPath, 0o755)

    fs.writeFileSync(
      path.join(fixtureRoot, "package.json"),
      JSON.stringify(
        {
          scripts: {
            "os:begin": `node ${path.join(process.cwd(), "tools", "openspec-begin-change.mjs")}`,
          },
        },
        null,
        2,
      ),
      "utf8",
    )

    const dispatcherDir = path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo")
    const releaseDir = path.join(fixtureRoot, "openspec", "changes", "release-demo")
    fs.mkdirSync(dispatcherDir, { recursive: true })
    fs.mkdirSync(releaseDir, { recursive: true })
    fs.writeFileSync(
      path.join(dispatcherDir, ".openspec.yaml"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "focus-demo"
strategy_root: "focus-demo"
roadmap_ref: "focus-demo/roadmaps/demo.md"
release_ref: ""
`,
      "utf8",
    )
    fs.writeFileSync(
      path.join(releaseDir, ".openspec.yaml"),
      `change_kind: "release"
execution_mode: "no-code"
`,
      "utf8",
    )

    const createdDir = path.join(fixtureRoot, "openspec", "changes", "implement-demo-task")

    const result = runToolInFixture({
      cwd: fixtureRoot,
      argv: [
        "release-demo",
        "--dispatcher",
        "dispatcher-demo",
        "--kind",
        "implement",
        "--name",
        "demo-task",
        "--description",
        "подготовить демонстрационный implement change",
      ],
      runner: runOpenSpecDispatch,
      env: {
        PATH: `${binDir}:${process.env.PATH || ""}`,
      },
    })

    expect(result.thrown).toBeUndefined()

    expect(fs.existsSync(path.join(createdDir, ".openspec.yaml"))).toBe(true)
    expect(fs.existsSync(path.join(createdDir, "handoff.md"))).toBe(true)

    const metadata = fs.readFileSync(path.join(createdDir, ".openspec.yaml"), "utf8")
    const handoff = fs.readFileSync(path.join(createdDir, "handoff.md"), "utf8")
    expect(metadata).toContain('parent_change: "dispatcher-demo"')
    expect(metadata).toContain('release_ref: "release-demo"')
    expect(handoff).toContain("## Миссия")
    expect(handoff).toContain("parent_change: dispatcher-demo")
    expect(handoff).toContain("Что должен изменить этот change: подготовить демонстрационный implement change")
  })
})
