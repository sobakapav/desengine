// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик выводит исполнительские задачи по producer"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { runListOpenSpecProducers } from "../../tools/list-openspec-producers.mjs"
import { runToolInFixture } from "../helpers/run-tool-fixture"

function writeChange(baseDir: string, relativeDir: string, metadata: string) {
  const changeDir = path.join(baseDir, relativeDir)
  fs.mkdirSync(changeDir, { recursive: true })
  fs.writeFileSync(path.join(changeDir, ".openspec.yaml"), `${metadata}\n`, "utf8")
  fs.writeFileSync(path.join(changeDir, "proposal.md"), "## Why\n\nТестовый change.\n", "utf8")
}

const tempDirs: string[] = []

describe("openspec producer list", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("показывает implement/fix changes по producer и при producer_ref, и при прямом parent_change", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-producer-list-"))
    tempDirs.push(fixtureRoot)

    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "producer-alpha"),
      'change_kind: "producer"\nshort: "producer alpha"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-alpha"),
      'change_kind: "dispatcher"\nparent_change: "focus-demo"\nshort: "диспетчер alpha"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "implement-alpha"),
      'change_kind: "implement"\nparent_change: "dispatcher-alpha"\nproducer_ref: "producer-alpha"\nshort: "реализация alpha"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "fix-alpha"),
      'change_kind: "fix"\nparent_change: "dispatcher-alpha"\nproducer_ref: "producer-alpha"\nshort: "фикс alpha"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "implement-direct"),
      'change_kind: "implement"\nparent_change: "producer-alpha"\nshort: "реализация напрямую"',
    )
    writeChange(
      fixtureRoot,
      path.join("openspec", "changes", "producer-empty"),
      'change_kind: "producer"\nshort: "producer empty"',
    )

    const { stdout, thrown } = runToolInFixture({
      cwd: fixtureRoot,
      runner: runListOpenSpecProducers,
    })

    expect(thrown).toBeUndefined()
    const output = stdout

    expect(output).toContain("\u001B[97mproducer-alpha\u001B[0m\tproducer alpha")
    expect(output).toContain("  implement-alpha\tреализация alpha")
    expect(output).toContain("  implement-direct\tреализация напрямую")
    expect(output).toContain("  fix-alpha\tфикс alpha")
    expect(output).not.toContain("dispatcher-alpha")
    expect(output).not.toContain("диспетчер alpha")
    expect(output).not.toContain("producer-empty")
  })
})
