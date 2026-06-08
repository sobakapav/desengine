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

    expect(output).toContain("\u001B[97mrelease-live\u001B[0m\tактуальный релиз")
    expect(output).toContain("  implement-live\tактуальная поставка")
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

    expect(output).toContain("  dispatcher-alpha\tдиспетчер альфа")
    expect(output).toContain("    fix-b\tпоставка б")
    expect(output).toContain("    implement-a\tпоставка а")
  })
})
