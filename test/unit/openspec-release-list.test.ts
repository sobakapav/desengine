// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик выводит список релизов"
// @openSpec  - "Названия root changes подсвечиваются ярко-белым"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { runListOpenSpecReleases } from "../../tools/list-openspec-releases.mjs"
import { runToolInFixture } from "../helpers/run-tool-fixture"

const ANSI_PATTERN = /\u001B\[[0-9;]*m/g

function stripAnsi(value: string) {
  return value.replace(ANSI_PATTERN, "")
}

function writeChange(baseDir: string, relativeDir: string, metadata: string) {
  const changeDir = path.join(baseDir, relativeDir)
  fs.mkdirSync(changeDir, { recursive: true })
  fs.writeFileSync(path.join(changeDir, ".openspec.yaml"), `${metadata}\n`, "utf8")
  fs.writeFileSync(path.join(changeDir, "proposal.md"), "## Why\n\nТестовый change.\n", "utf8")
}

const tempDirs: string[] = []

describe("openspec release list", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("показывает только активные release changes и активный состав", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-list-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-live"),
      'change_kind: "release"\nshort: "актуальный релиз"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "implement-live"),
      'change_kind: "implement"\nshort: "актуальная поставка"\nparent_change: ""\nrelease_ref: "release-live"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "archive", "2026-05-20-release-old"),
      'change_kind: "release"\nshort: "архивный релиз"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "archive", "2026-05-20-implement-old"),
      'change_kind: "implement"\nshort: "архивная поставка"\nparent_change: ""\nrelease_ref: "release-live"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListOpenSpecReleases,
    })

    expect(thrown).toBeUndefined()
    const output = stdout

    expect(output).toMatch(/🌟 \u001B\[97mrelease-live\u001B\[0m\s{2,}актуальный релиз/)
    expect(output).toMatch(/      implement-live\s{2,}актуальная поставка/)
    expect(output).not.toContain("release-old")
    expect(output).not.toContain("архивный релиз")
    expect(output).not.toContain("implement-old")
    expect(output).not.toContain("архивная поставка")
  })

  it("печатает активный состав релиза как матрицу dispatcher -> implement/fix", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-matrix-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-live"),
      'change_kind: "release"\nshort: "актуальный релиз"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-alpha"),
      'change_kind: "dispatcher"\nshort: "диспетчер альфа"\nparent_change: "focus-demo"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "implement-a"),
      'change_kind: "implement"\nshort: "поставка а"\nparent_change: "dispatcher-alpha"\nrelease_ref: "release-live"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-b"),
      'change_kind: "fix"\nshort: "поставка б"\nparent_change: "dispatcher-alpha"\nrelease_ref: "release-live"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListOpenSpecReleases,
    })

    expect(thrown).toBeUndefined()
    const output = stdout

    expect(output).toMatch(/  🔸 dispatcher-alpha\s{2,}диспетчер альфа/)
    expect(output).toMatch(/    🔥 fix-b\s{2,}поставка б/)
    expect(output).toMatch(/      implement-a\s{2,}поставка а/)
  })

  it("не считает dispatcher и producer валидным составом релиза, если нет implement/fix", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-list-kinds-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-live"),
      'change_kind: "release"\nshort: "актуальный релиз"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-alpha"),
      'change_kind: "dispatcher"\nshort: "диспетчер альфа"\nparent_change: "focus-demo"\nrelease_ref: "release-live"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "producer-alpha"),
      'change_kind: "producer"\nshort: "продюсер альфа"\nparent_change: "focus-demo"\nrelease_ref: "release-live"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListOpenSpecReleases,
    })

    expect(thrown).toBeUndefined()
    const output = stdout

    expect(output).toMatch(/  \(пусто\)\s{2,}нет привязанных changes/)
    expect(output).not.toContain("диспетчер альфа")
    expect(output).not.toContain("продюсер альфа")
  })

  it("выравнивает краткие описания release-members одного уровня в общую колонку", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-list-align-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-live"),
      'change_kind: "release"\nshort: "актуальный релиз"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-short"),
      'change_kind: "dispatcher"\nshort: "короткий диспетчер"\nparent_change: "focus-demo"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-very-long-name"),
      'change_kind: "dispatcher"\nshort: "длинный диспетчер"\nparent_change: "focus-demo"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-a"),
      'change_kind: "fix"\nshort: "короткий sibling"\nparent_change: "dispatcher-short"\nrelease_ref: "release-live"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-b"),
      'change_kind: "fix"\nshort: "длинный sibling"\nparent_change: "dispatcher-very-long-name"\nrelease_ref: "release-live"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListOpenSpecReleases,
    })

    expect(thrown).toBeUndefined()

    const lines = stripAnsi(stdout)
      .split("\n")
      .filter((line) => line.includes("диспетчер"))

    expect(lines).toHaveLength(2)
    expect(lines[0].indexOf("короткий диспетчер")).toBe(lines[1].indexOf("длинный диспетчер"))
  })

  it("вставляет пустую строку при возврате из глубокой release-ветки к соседнему уровню", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-list-spacing-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-live"),
      'change_kind: "release"\nshort: "актуальный релиз"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-alpha"),
      'change_kind: "dispatcher"\nshort: "диспетчер альфа"\nparent_change: "focus-demo"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-beta"),
      'change_kind: "dispatcher"\nshort: "диспетчер бета"\nparent_change: "focus-demo"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-a"),
      'change_kind: "fix"\nshort: "поставка а"\nparent_change: "dispatcher-alpha"\nrelease_ref: "release-live"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-b"),
      'change_kind: "fix"\nshort: "поставка б"\nparent_change: "dispatcher-beta"\nrelease_ref: "release-live"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListOpenSpecReleases,
    })

    expect(thrown).toBeUndefined()
    expect(stripAnsi(stdout)).toContain("поставка а\n\n  🔸 dispatcher-beta")
  })

  it("разделяет соседние релизы пустой строкой", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-release-list-release-gap-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-alpha"),
      'change_kind: "release"\nshort: "релиз альфа"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-beta"),
      'change_kind: "release"\nshort: "релиз бета"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListOpenSpecReleases,
    })

    expect(thrown).toBeUndefined()
    expect(stripAnsi(stdout)).toContain("релиз альфа\n\n🌟 release-beta")
  })
})
