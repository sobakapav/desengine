// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Система выбирает Sandpack App template по уровню задачи"

import { mkdir, rm, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  buildLevelTemplateRuntimeSource,
  readLevelSandpackTemplate,
} from "../../lib/lab/sandpack-template"
import { level5AppTemplateSource } from "./sandpack-preview.helpers"

function buildTempRootDir(testName: string) {
  return path.join(
    os.tmpdir(),
    "desengine-test",
    `sandpack-template-${testName}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
  )
}

describe("readLevelSandpackTemplate", () => {
  it("читает level-owned template из onboarding-совместимого layout", async () => {
    const rootDir = buildTempRootDir("level-owned-onboarding")
    const sandpackDir = path.join(rootDir, "onboarding", "levels", "level-5", "sandpack")
    await mkdir(sandpackDir, { recursive: true })
    await writeFile(path.join(sandpackDir, "App.tsx"), level5AppTemplateSource, "utf-8")

    const result = await readLevelSandpackTemplate("level-5", { rootDir })

    expect(result.source).toBe("level")
    expect(result.appTsx).toContain('import * as mockModule from "./mock"')
    expect(result.appTsx).toContain("const previewMock = mockModule.mock")
    expect(result.appTsx).toContain("const explicit = mockModule.mockProps ?? mockModule.mock")
    expect(result.appTsx).toContain("Array.isArray(previewMock)")
    expect(result.appTsx).toContain("PreviewRuntimeContractBoundary")

    await rm(rootDir, { recursive: true, force: true })
  })

  it("возвращает level-owned template, если он есть на диске", async () => {
    const rootDir = buildTempRootDir("level-owned")
    const sandpackDir = path.join(rootDir, "onboarding", "levels", "level-1", "sandpack")
    await mkdir(sandpackDir, { recursive: true })
    await writeFile(
      path.join(sandpackDir, "App.tsx"),
      'export default function App(){ return <div data-testid="level-1-template" /> }\n',
      "utf-8",
    )

    const result = await readLevelSandpackTemplate("level-1", { rootDir })
    expect(result.source).toBe("level")
    expect(result.appTsx).toContain("level-1-template")

    await rm(rootDir, { recursive: true, force: true })
  })

  it("поддерживает плоский layout levels/<levelId>/sandpack без onboarding-префикса", async () => {
    const rootDir = buildTempRootDir("flat-levels")
    const sandpackDir = path.join(rootDir, "levels", "level-2", "sandpack")
    await mkdir(sandpackDir, { recursive: true })
    await writeFile(
      path.join(sandpackDir, "App.tsx"),
      'export default function App(){ return <div data-testid="flat-level-template" /> }\n',
      "utf-8",
    )

    const result = await readLevelSandpackTemplate("level-2", { rootDir })
    expect(result.source).toBe("level")
    expect(result.appTsx).toContain("flat-level-template")

    await rm(rootDir, { recursive: true, force: true })
  })

  it("возвращает fallback template, если level-owned файла нет", async () => {
    const rootDir = buildTempRootDir("fallback")
    await mkdir(path.join(rootDir, "onboarding", "levels", "level-3"), { recursive: true })

    const result = await readLevelSandpackTemplate("level-3", { rootDir })
    expect(result.source).toBe("fallback")
    expect(result.appTsx).toContain("desengine-preview-root")

    await rm(rootDir, { recursive: true, force: true })
  })
})

describe("buildLevelTemplateRuntimeSource", () => {
  it("генерирует стабильный runtime-модуль для шаблона уровня", () => {
    const code = buildLevelTemplateRuntimeSource({
      levelId: "level-2",
      levelNumber: 2,
      labId: "level-2-lab",
    })

    expect(code).toContain("export const levelRuntime")
    expect(code).toContain('"levelId": "level-2"')
    expect(code).toContain('"levelNumber": 2')
    expect(code).toContain('"labId": "level-2-lab"')
  })
})
