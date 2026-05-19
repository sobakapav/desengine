// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Preview принимает UI-импорты из components/ui"
// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import { mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { loadSandpackDefaultTemplates } from "../../lib/lab/sandpack-default-templates"

function buildTempRootDir(testName: string) {
  return path.join(
    os.tmpdir(),
    "desengine-test",
    `sandpack-default-templates-${testName}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  )
}

async function writeTemplateFiles(rootDir: string) {
  const templatesDir = path.join(rootDir, "lib", "lab", "sandpack-templates", "default")
  await mkdir(path.join(templatesDir, "public"), { recursive: true })

  await Promise.all([
    writeFile(path.join(templatesDir, "public", "index.html"), "<!-- from-disk -->\n", "utf-8"),
    writeFile(path.join(templatesDir, "index.tsx"), "/* __EXTRA_IMPORTS__ */\n", "utf-8"),
    writeFile(path.join(templatesDir, "tsconfig.json"), JSON.stringify({ compilerOptions: {} }), "utf-8"),
    writeFile(path.join(templatesDir, "tailwind.config.js"), "module.exports = {}\n", "utf-8"),
    writeFile(path.join(templatesDir, "postcss.config.js"), "module.exports = {}\n", "utf-8"),
    writeFile(path.join(templatesDir, "styles.css"), "/* css */\n", "utf-8"),
    writeFile(path.join(templatesDir, "package.json"), JSON.stringify({ main: "/index.tsx", dependencies: {} }), "utf-8"),
  ])
}

describe("loadSandpackDefaultTemplates", () => {
  it("читает шаблоны с диска из указанного rootDir", async () => {
    const rootDir = buildTempRootDir("from-disk")
    await writeTemplateFiles(rootDir)

    const templates = loadSandpackDefaultTemplates({ rootDir })
    expect(templates.indexHtml).toContain("from-disk")
    expect(templates.indexTsxTemplate).toContain("__EXTRA_IMPORTS__")
    expect(templates.packageJson).toMatchObject({ main: "/index.tsx" })

    await rm(rootDir, { recursive: true, force: true })
  })

  it("не падает, если шаблонов нет на диске (fallback)", async () => {
    const rootDir = buildTempRootDir("fallback")
    await mkdir(rootDir, { recursive: true })

    const templates = loadSandpackDefaultTemplates({ rootDir })
    expect(templates.indexHtml).toContain("<!DOCTYPE html>")
    expect(templates.packageJson).toMatchObject({ main: "/index.tsx" })

    await rm(rootDir, { recursive: true, force: true })
  })
})

