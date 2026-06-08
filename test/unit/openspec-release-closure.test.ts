// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик пытается закрыть release с незакрытым составом"

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

describe("openspec release closure guard", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("не допускает active changes, которые продолжают ссылаться на уже архивированный release", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-closure-"))
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
roadmap_ref: "focus-demo/roadmaps/demo.md"
short: "диспетчер демо"
`,
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "focus-demo", "roadmaps", "demo.md"),
      "# demo\n",
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "fix-alpha", ".openspec.yaml"),
      `change_kind: "fix"
execution_mode: "code"
parent_change: "dispatcher-demo"
strategy_root: "focus-demo"
release_ref: "release-demo"
verification_level: "unit"
verification_command: "npm run test:unit"
short: "фикс альфа"
`,
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "fix-beta", ".openspec.yaml"),
      `change_kind: "fix"
execution_mode: "code"
parent_change: "dispatcher-demo"
strategy_root: "focus-demo"
release_ref: "release-demo"
verification_level: "unit"
verification_command: "npm run test:unit"
short: "фикс бета"
`,
    )
    writeFile(
      path.join(fixtureRoot, "openspec", "changes", "archive", "2026-06-08-release-demo", ".openspec.yaml"),
      'change_kind: "release"\nexecution_mode: "no-code"\nparent_change: ""\nstrategy_root: ""\nshort: "релиз демо"\n',
    )

    const errors = validateChanges(fixtureRoot, path.join(fixtureRoot, "openspec", "changes")).join("\n")

    expect(errors).toContain("release_ref ссылается на архивированный release release-demo")
    expect(errors).toContain("release change можно закрывать только после закрытия всех active changes состава")
    expect(errors).toContain("(fix-alpha, fix-beta)")
  })
})
