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

function readLevel3TipFiles() {
  const tasksRoot = path.join(process.cwd(), "onboarding", "tasks")
  const taskDirs = fs.readdirSync(tasksRoot, { withFileTypes: true })
  const tipFiles: Array<{ relativePath: string; source: string }> = []

  for (const taskDir of taskDirs) {
    if (!taskDir.isDirectory()) {
      continue
    }

    const tipPath = path.join(tasksRoot, taskDir.name, "levels", "level-3", "tip.md")
    if (!fs.existsSync(tipPath)) {
      continue
    }

    tipFiles.push({
      relativePath: path.relative(process.cwd(), tipPath),
      source: fs.readFileSync(tipPath, "utf8"),
    })
  }

  return tipFiles
}

describe("onboarding level-3 style guidance", () => {
  it("держит канонический styles.ts во всех user-facing подсказках уровня", () => {
    const overview = readProjectFile("onboarding", "levels", "level-3", "overview.md")
    const checkPrompt = readProjectFile("onboarding", "prompts", "levels", "level-3", "check.njk")
    const tipFiles = readLevel3TipFiles()

    expect(overview).toContain("`styles.ts`")
    expect(checkPrompt).toContain("`Component.tsx` и `styles.ts`")
    expect(checkPrompt).not.toContain("style.ts")

    for (const tipFile of tipFiles) {
      expect(tipFile.source, tipFile.relativePath).not.toContain("style.ts")
      expect(tipFile.source, tipFile.relativePath).not.toContain("style.scc")
    }
  })
})
