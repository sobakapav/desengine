// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик выводит список релизов"
// @openSpec  - "Названия root changes подсвечиваются ярко-белым"

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

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

    const output = execFileSync(process.execPath, [path.join(process.cwd(), "tools", "list-openspec-releases.mjs")], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    expect(output).toContain("\u001B[97mrelease-live\u001B[0m\tактуальный релиз")
    expect(output).toContain("  implement-live\tактуальная поставка")
    expect(output).not.toContain("release-old")
    expect(output).not.toContain("архивный релиз")
    expect(output).not.toContain("implement-old")
    expect(output).not.toContain("архивная поставка")
  })
})
