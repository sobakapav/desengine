// @openSpec capability: component-file-set
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает форму уточняющего промпта"
// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Система показывает общее пояснение уровня пользователю"
// @openSpec  - "Система показывает task-specific пояснение уровня пользователю"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("onboarding level-3 style guidance", () => {
  it("держит канонический styles.ts во всех repo-owned контрактах уровня и workbench", () => {
    const spec = readProjectFile("openspec", "specs", "level-labs", "spec.md")
    const iteratePrompt = readProjectFile("prompts", "iterate-component.njk")
    const workbenchConfig = readProjectFile("components", "desengine", "lab", "Workbench", "config.ts")

    expect(spec).toContain("`styles.ts`")
    expect(spec).not.toContain("style.ts")
    expect(spec).not.toContain("style.scc")
    expect(iteratePrompt).toContain("`styles.ts`")
    expect(iteratePrompt).not.toContain("style.ts")
    expect(workbenchConfig).toContain('fileName: "styles.ts"')
  })
})
