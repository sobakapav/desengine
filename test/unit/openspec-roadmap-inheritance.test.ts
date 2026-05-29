// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Стратегический change публикует roadmap для потомков"
// @openSpec  - "Dispatcher ссылается на унаследованный roadmap"
// @openSpec  - "Dispatcher использует несколько roadmap"
// @openSpec  - "Создаётся producer change"
// @openSpec  - "Producer передаёт delivery downstream dispatcher"
// @openSpec  - "Implement или fix помечается producer-контекстом"
// @openSpec  - "Dispatcher не подчиняется producer напрямую"
// @openSpec  - "Dispatcher не может хранить producer-контекст"
// @openSpec  - "Разработчик открывает implement/fix через `os:ctx`"
// @openSpec  - "Разработчик открывает implement/fix из release-контекста через `os:ctx`"

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { validateChanges } from "../../tools/testing/traceability/changes.mjs"

const tempDirs: string[] = []

function writeFile(filePath: string, content: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, "utf8")
}

describe("openspec roadmap inheritance", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("валидирует dispatcher с одним и несколькими roadmap стратегических владельцев", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-roadmaps-"))
    tempDirs.push(fixtureRoot)

    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", ".openspec.yaml"),
      'change_kind: "focus"\nexecution_mode: "no-code"\nparent_change: ""\nstrategy_root: ""\nshort: "фокус демо"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", "roadmaps", "demo.md"),
      "# demo\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", ".openspec.yaml"),
      'change_kind: "producer"\nexecution_mode: "no-code"\nparent_change: "focus-demo"\nstrategy_root: "focus-demo"\nshort: "producer demo"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", "roadmaps", "extra.md"),
      "# extra\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo", ".openspec.yaml"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "focus-demo"
strategy_root: "producer-demo"
roadmap_ref: "focus-demo/roadmaps/demo.md"
roadmap_refs:
  - "producer-demo/roadmaps/extra.md"
short: "диспетчер демо"
`,
    )

    const errors = validateChanges(fixtureRoot, path.join(fixtureRoot, "openspec", "changes"))

    expect(errors).toEqual([])
  })

  it("не принимает локальный roadmap dispatcher как источник истины", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-roadmaps-local-"))
    tempDirs.push(fixtureRoot)

    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", ".openspec.yaml"),
      'change_kind: "focus"\nexecution_mode: "no-code"\nparent_change: ""\nstrategy_root: ""\nshort: "фокус демо"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo", ".openspec.yaml"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "focus-demo"
strategy_root: "focus-demo"
roadmap_ref: "roadmaps/demo.md"
short: "диспетчер демо"
`,
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo", "roadmaps", "demo.md"),
      "# local roadmap\n",
    )

    const errors = validateChanges(fixtureRoot, path.join(fixtureRoot, "openspec", "changes"))

    expect(errors.join("\n")).toContain("roadmap reference должен иметь вид <change>/roadmaps/<file>.md")
  })

  it("не допускает прямое parent_change dispatcher на producer", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-roadmaps-producer-parent-"))
    tempDirs.push(fixtureRoot)

    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", ".openspec.yaml"),
      'change_kind: "focus"\nexecution_mode: "no-code"\nparent_change: ""\nstrategy_root: ""\nshort: "фокус демо"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", ".openspec.yaml"),
      'change_kind: "producer"\nexecution_mode: "no-code"\nparent_change: "focus-demo"\nstrategy_root: "focus-demo"\nshort: "producer demo"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", "roadmaps", "extra.md"),
      "# extra\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo", ".openspec.yaml"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "producer-demo"
strategy_root: "producer-demo"
roadmap_ref: "producer-demo/roadmaps/extra.md"
short: "диспетчер демо"
`,
    )

    const errors = validateChanges(fixtureRoot, path.join(fixtureRoot, "openspec", "changes"))

    expect(errors.join("\n")).toContain("dispatcher change не может иметь parent_change на producer")
  })

  it("не допускает producer_ref в metadata dispatcher", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-roadmaps-producer-ref-dispatcher-"))
    tempDirs.push(fixtureRoot)

    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", ".openspec.yaml"),
      'change_kind: "focus"\nexecution_mode: "no-code"\nparent_change: ""\nstrategy_root: ""\nshort: "фокус демо"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", "roadmaps", "demo.md"),
      "# demo\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", ".openspec.yaml"),
      'change_kind: "producer"\nexecution_mode: "no-code"\nparent_change: "focus-demo"\nstrategy_root: "focus-demo"\nshort: "producer demo"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", "roadmaps", "extra.md"),
      "# extra\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo", ".openspec.yaml"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "focus-demo"
strategy_root: "focus-demo"
roadmap_ref: "focus-demo/roadmaps/demo.md"
producer_ref: "producer-demo"
short: "диспетчер демо"
`,
    )

    const errors = validateChanges(fixtureRoot, path.join(fixtureRoot, "openspec", "changes"))

    expect(errors.join("\n")).toContain("dispatcher change не может иметь producer_ref")
  })

  it("os:ctx показывает inherited roadmap parent dispatcher", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-roadmaps-ctx-"))
    tempDirs.push(fixtureRoot)

    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", ".openspec.yaml"),
      'change_kind: "focus"\nexecution_mode: "no-code"\nparent_change: ""\nstrategy_root: ""\nshort: "фокус демо"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", "roadmaps", "demo.md"),
      "# demo\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo", ".openspec.yaml"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "focus-demo"
strategy_root: "focus-demo"
roadmap_ref: "focus-demo/roadmaps/demo.md"
short: "диспетчер демо"
`,
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", ".openspec.yaml"),
      'change_kind: "producer"\nexecution_mode: "no-code"\nparent_change: "focus-demo"\nstrategy_root: "focus-demo"\nshort: "producer demo"\n',
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "producer-demo", "roadmaps", "extra.md"),
      "# extra\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "implement-demo", ".openspec.yaml"),
      `change_kind: "implement"
execution_mode: "code"
parent_change: "dispatcher-demo"
strategy_root: "focus-demo"
release_ref: "release-demo"
producer_ref: "producer-demo"
verification_level: "unit"
verification_command: "npm run test:unit"
short: "реализация демо"
`,
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "release-demo", ".openspec.yaml"),
      'change_kind: "release"\nexecution_mode: "no-code"\nshort: "релиз демо"\n',
    )
    writeFile(path.join(fixtureRoot, "openspec", "changes", "implement-demo", "handoff.md"), "# handoff\n")

    const output = execFileSync(process.execPath, [path.join(process.cwd(), "tools", "openspec-context.mjs"), "implement-demo"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    expect(output).toContain("dispatcher proposal")
    expect(output).toContain("release_ref: release-demo")
    expect(output).toContain("inherited roadmap: openspec/changes/focus-demo/roadmaps/demo.md")
    expect(output).toContain("producer_ref: producer-demo")
    expect(output).toContain("producer proposal")
    expect(output).toContain("local handoff: openspec/changes/implement-demo/handoff.md")
  })
})
