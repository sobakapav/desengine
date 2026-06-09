// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик запускает `npm run os`"
// @openSpec  - "Разработчик запускает `npm run os:short`"
// @openSpec  - "Разработчик фильтрует внимание через `npm run os -- <word>`"
// @openSpec  - "Названия root changes подсвечиваются ярко-белым"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { runListActiveOpenSpecChanges } from "../../tools/list-active-openspec-changes.mjs"
import { runToolInFixture } from "../helpers/run-tool-fixture"

const tempDirs: string[] = []
const ANSI_PATTERN = /\u001B\[[0-9;]*m/g

function stripAnsi(value: string) {
  return value.replace(ANSI_PATTERN, "")
}

function writeChange(baseDir: string, relativeDir: string, metadata: string, proposal = "## Why\n\nТестовый change.\n") {
  const changeDir = path.join(baseDir, relativeDir)
  fs.mkdirSync(changeDir, { recursive: true })
  fs.writeFileSync(path.join(changeDir, ".openspec.yaml"), `${metadata}\n`, "utf8")
  fs.writeFileSync(path.join(changeDir, "proposal.md"), proposal, "utf8")
}

describe("openspec listing", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("показывает дерево active changes с role-эмодзи", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-listing-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "focus-demo"),
      'change_kind: "focus"\nshort: "фокус демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "producer-demo"),
      'change_kind: "producer"\nparent_change: "focus-demo"\nshort: "продюсер демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-demo"),
      'change_kind: "dispatcher"\nparent_change: "focus-demo"\nshort: "диспетчер демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-demo"),
      'change_kind: "fix"\nparent_change: "dispatcher-demo"\nshort: "фикс демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-demo"),
      'change_kind: "release"\nshort: "релиз демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "idea-demo"),
      'change_kind: "idea"\nshort: "идея демо"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListActiveOpenSpecChanges,
    })

    expect(thrown).toBeUndefined()
    const output = stdout

    expect(output).toMatch(/🩸 \u001B\[97mfocus-demo\u001B\[0m\s{2,}фокус демо/)
    expect(output).toMatch(/  🍀 producer-demo\s{2,}продюсер демо/)
    expect(output).toMatch(/  🔸 dispatcher-demo\s{2,}диспетчер демо/)
    expect(output).toMatch(/    🔥 fix-demo\s{2,}фикс демо/)
    expect(output).toMatch(/🌟 \u001B\[97mrelease-demo\u001B\[0m\s{2,}релиз демо/)
    expect(output).toMatch(/🦋 \u001B\[97midea-demo\u001B\[0m\s{2,}идея демо/)
  })

  it("подсвечивает переданное слово красным ANSI-цветом", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-listing-highlight-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-demo"),
      'change_kind: "dispatcher"\nshort: "диспетчер demo dispatcher"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      argv: ["dispatcher"],
      runner: runListActiveOpenSpecChanges,
    })

    expect(thrown).toBeUndefined()
    const output = stdout

    expect(output).toContain("\u001B[31mdispatcher\u001B[0m-demo")
    expect(output).toContain("demo \u001B[31mdispatcher\u001B[0m")
  })

  it("в режиме short не показывает implement и fix changes", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-listing-short-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "focus-demo"),
      'change_kind: "focus"\nshort: "фокус демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-demo"),
      'change_kind: "dispatcher"\nparent_change: "focus-demo"\nshort: "диспетчер демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "implement-demo"),
      'change_kind: "implement"\nparent_change: "dispatcher-demo"\nshort: "реализация демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-demo"),
      'change_kind: "fix"\nparent_change: "dispatcher-demo"\nshort: "фикс демо"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      argv: ["--short"],
      runner: runListActiveOpenSpecChanges,
    })

    expect(thrown).toBeUndefined()
    const output = stdout

    expect(output).toMatch(/🩸 focus-demo\s{2,}фокус демо/)
    expect(output).toMatch(/  🔸 dispatcher-demo\s{2,}диспетчер демо/)
    expect(output).not.toContain("implement-demo")
    expect(output).not.toContain("fix-demo")
  })

  it("выравнивает краткие описания changes одного уровня в общую колонку", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-listing-align-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "focus-demo"),
      'change_kind: "focus"\nshort: "фокус демо"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-short"),
      'change_kind: "dispatcher"\nparent_change: "focus-demo"\nshort: "краткий sibling"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-very-long-name"),
      'change_kind: "dispatcher"\nparent_change: "focus-demo"\nshort: "длинный sibling"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListActiveOpenSpecChanges,
    })

    expect(thrown).toBeUndefined()

    const lines = stripAnsi(stdout)
      .split("\n")
      .filter((line) => line.includes("sibling"))

    expect(lines).toHaveLength(2)
    expect(lines[0].indexOf("краткий sibling")).toBe(lines[1].indexOf("длинный sibling"))
  })
})
