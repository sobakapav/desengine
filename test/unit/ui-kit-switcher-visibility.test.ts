// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь отключает UI kit"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("ui kit switcher visibility", () => {
  it("временно скрывает переключатель UI kit в Workbench UI", () => {
    const source = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchView.tsx")

    expect(source).toContain("const SHOW_UI_KIT_SWITCHER = false")
    expect(source).toContain("SHOW_UI_KIT_SWITCHER ? (")
    expect(source).toContain("<ProjectSettings")
  })
})
