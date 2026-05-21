// @openSpec capability: admin-tools
// @openSpec scenarios:
// @openSpec  - "Разработчик переименовывает change через admin-команду"
// @openSpec  - "Разработчик задаёт имя change с голым суффиксом даты"

import { execFileSync } from "node:child_process"
import fs from "node:fs"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import { assertValidChangeName, normalizeDispatchedChangeName } from "../../tools/openspec-change-name.mjs"

const tempDirs: string[] = []

function makeChange(rootDir: string, relativeDir: string, metadata: string, readme = "", proposal = "") {
  const changeDir = path.join(rootDir, relativeDir)
  fs.mkdirSync(changeDir, { recursive: true })
  fs.writeFileSync(path.join(changeDir, ".openspec.yaml"), `${metadata}\n`, "utf8")
  fs.writeFileSync(path.join(changeDir, "README.md"), `${readme}\n`, "utf8")
  fs.writeFileSync(path.join(changeDir, "proposal.md"), `${proposal}\n`, "utf8")
}

describe("openspec rename", () => {
  afterEach(() => {
    while (tempDirs.length > 0) {
      const dirPath = tempDirs.pop()
      if (dirPath) {
        fs.rmSync(dirPath, { recursive: true, force: true })
      }
    }
  })

  it("переименовывает change и обновляет metadata-ссылки", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-rename-"))
    tempDirs.push(fixtureRoot)

    makeChange(
      fixtureRoot,
      path.join("openspec", "changes", "release-may-21"),
      'change_kind: "release"\nshort: "релизный поток"',
      "# release-may-21",
      "- Создан release change `release-may-21`.",
    )
    makeChange(
      fixtureRoot,
      path.join("openspec", "changes", "implement-live"),
      'change_kind: "implement"\nparent_change: "dispatcher-openspec"\nstrategy_root: "focus-workflow"\nrelease_ref: "release-may-21"',
      "# implement-live",
      "release_ref: release-may-21",
    )

    execFileSync(process.execPath, [path.join(process.cwd(), "tools", "rename-openspec-change.mjs"), "release-may-21", "release-2026-05-21-day"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    expect(fs.existsSync(path.join(fixtureRoot, "openspec", "changes", "release-may-21"))).toBe(false)
    expect(fs.existsSync(path.join(fixtureRoot, "openspec", "changes", "release-2026-05-21-day"))).toBe(true)
    expect(
      fs.readFileSync(path.join(fixtureRoot, "openspec", "changes", "release-2026-05-21-day", "README.md"), "utf8"),
    ).toContain("release-2026-05-21-day")
    expect(
      fs.readFileSync(path.join(fixtureRoot, "openspec", "changes", "release-2026-05-21-day", "proposal.md"), "utf8"),
    ).toContain("release-2026-05-21-day")
    expect(
      fs.readFileSync(path.join(fixtureRoot, "openspec", "changes", "implement-live", ".openspec.yaml"), "utf8"),
    ).toContain('release_ref: "release-2026-05-21-day"')
  })

  it("обновляет roadmap_ref и roadmap_refs при переименовании стратегического владельца", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-rename-roadmaps-"))
    tempDirs.push(fixtureRoot)

    makeChange(
      fixtureRoot,
      path.join("openspec", "changes", "focus-workflow"),
      'change_kind: "focus"\nexecution_mode: "no-code"\nshort: "фокус workflow"',
      "# focus-workflow",
      "- Владеет roadmap `focus-workflow`.",
    )
    fs.mkdirSync(path.join(fixtureRoot, "openspec", "changes", "focus-workflow", "roadmaps"), { recursive: true })
    fs.writeFileSync(
      path.join(fixtureRoot, "openspec", "changes", "focus-workflow", "roadmaps", "openspec.md"),
      "roadmap owner focus-workflow\n",
      "utf8",
    )
    makeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-openspec"),
      `change_kind: "dispatcher"
execution_mode: "no-code"
parent_change: "focus-workflow"
strategy_root: "focus-workflow"
roadmap_ref: "focus-workflow/roadmaps/openspec.md"
roadmap_refs:
  - "focus-workflow/roadmaps/openspec.md"
  - "focus-workflow/roadmaps/second.md"
short: "диспетчер workflow"`,
      "# dispatcher-openspec",
      "focus-workflow/roadmaps/openspec.md",
    )
    fs.writeFileSync(
      path.join(fixtureRoot, "openspec", "changes", "focus-workflow", "roadmaps", "second.md"),
      "secondary roadmap owner focus-workflow\n",
      "utf8",
    )

    execFileSync(process.execPath, [path.join(process.cwd(), "tools", "rename-openspec-change.mjs"), "focus-workflow", "focus-governance"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    const dispatcherMeta = fs.readFileSync(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-openspec", ".openspec.yaml"),
      "utf8",
    )
    const roadmapText = fs.readFileSync(
      path.join(fixtureRoot, "openspec", "changes", "focus-governance", "roadmaps", "openspec.md"),
      "utf8",
    )

    expect(dispatcherMeta).toContain('roadmap_ref: "focus-governance/roadmaps/openspec.md"')
    expect(dispatcherMeta).toContain('- "focus-governance/roadmaps/openspec.md"')
    expect(dispatcherMeta).toContain('- "focus-governance/roadmaps/second.md"')
    expect(roadmapText).toContain("focus-governance")
  })

  it("обновляет producer_ref при переименовании producer change", () => {
    const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "openspec-rename-producer-ref-"))
    tempDirs.push(fixtureRoot)

    makeChange(
      fixtureRoot,
      path.join("openspec", "changes", "producer-demo"),
      'change_kind: "producer"\nexecution_mode: "no-code"\nshort: "producer demo"',
      "# producer-demo",
      "producer-demo",
    )
    makeChange(
      fixtureRoot,
      path.join("openspec", "changes", "dispatcher-demo"),
      'change_kind: "dispatcher"\nexecution_mode: "no-code"\nparent_change: "focus-demo"\nstrategy_root: "focus-demo"\nroadmap_ref: "focus-demo/roadmaps/demo.md"\nproducer_ref: "producer-demo"\nshort: "диспетчер demo"',
    )

    execFileSync(process.execPath, [path.join(process.cwd(), "tools", "rename-openspec-change.mjs"), "producer-demo", "producer-guidance"], {
      cwd: fixtureRoot,
      encoding: "utf8",
    })

    const dispatcherMeta = fs.readFileSync(
      path.join(fixtureRoot, "openspec", "changes", "dispatcher-demo", ".openspec.yaml"),
      "utf8",
    )

    expect(dispatcherMeta).toContain('producer_ref: "producer-guidance"')
  })

  it("запрещает голый суффикс даты в имени change", () => {
    expect(() => assertValidChangeName("release-2026-05-21")).toThrow(/суффикс даты/)
    expect(() => normalizeDispatchedChangeName("fix", "release-2026-05-21")).toThrow(/суффикс даты/)
    expect(normalizeDispatchedChangeName("fix", "release-2026-05-21-day")).toBe("fix-release-2026-05-21-day")
  })
})
