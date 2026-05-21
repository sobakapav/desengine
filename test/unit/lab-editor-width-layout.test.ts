// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает лабораторию уровня"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("lab editor width layout", () => {
  it("ограничивает editor-pane доступной шириной и держит список файлов отдельной колонкой", () => {
    const codeSource = readProjectFile("components", "desengine", "lab", "Code", "Code.tsx")
    const styleSource = readProjectFile("components", "desengine", "lab", "Code", "styles.ts")

    expect(codeSource).toContain("min-w-0 flex-col h-[34rem] gap-3 lg:flex-row")
    expect(codeSource).toContain('className="min-h-0 min-w-0 flex-1 p-0"')
    expect(styleSource).toContain('md:w-[18rem] md:max-w-[18rem] md:flex-none')
    expect(styleSource).toContain('content: "mt-0 h-full min-w-0 w-full"')
  })
})
