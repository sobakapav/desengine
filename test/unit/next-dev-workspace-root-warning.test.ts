// @openSpec capability: testing-layer
// @openSpec scenarios:
// @openSpec  - "Добавляется новый behavior-change"

import fs from "node:fs"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { afterEach, describe, expect, it, vi } from "vitest"

import nextConfig from "../../next.config"

const { default: loadConfig } = await import("next/dist/server/config")
const { Bundler } = await import("next/dist/lib/bundler")
const { PHASE_DEVELOPMENT_SERVER } = await import("next/dist/shared/lib/constants")

const tempDirs: string[] = []

afterEach(() => {
  vi.restoreAllMocks()

  while (tempDirs.length > 0) {
    const dirPath = tempDirs.pop()
    if (dirPath) {
      fs.rmSync(dirPath, { recursive: true, force: true })
    }
  }
})

function createProjectFixture() {
  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "next-root-warning-"))
  const projectDir = path.join(fixtureRoot, "app")

  tempDirs.push(fixtureRoot)
  fs.mkdirSync(projectDir, { recursive: true })
  fs.writeFileSync(path.join(fixtureRoot, "package-lock.json"), "{}")
  fs.writeFileSync(path.join(projectDir, "package-lock.json"), "{}")
  fs.writeFileSync(path.join(projectDir, "package.json"), JSON.stringify({ name: "fixture-app", private: true }))

  return { fixtureRoot, projectDir }
}

describe("next dev workspace root warning", () => {
  it("явно закрепляет turbopack root на каталоге next.config.ts и сохраняет tracing includes", () => {
    const configPath = fileURLToPath(new URL("../../next.config.ts", import.meta.url))

    expect(nextConfig.turbopack?.root).toBe(path.dirname(configPath))
    expect(nextConfig.outputFileTracingIncludes).toEqual({
      "/api/**": ["lib/lab/sandpack-templates/**"],
    })
  })

  it("не эмитит duplicated lockfile warning, когда turbopack.root задан явно", async () => {
    const { fixtureRoot, projectDir } = createProjectFixture()
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {})

    const withoutRootConfig = {
      outputFileTracingIncludes: {
        "/api/**": ["lib/lab/sandpack-templates/**"],
      },
    }

    await loadConfig(PHASE_DEVELOPMENT_SERVER, projectDir, {
      customConfig: withoutRootConfig,
      silent: false,
      bundler: Bundler.Turbopack,
    })

    const warningsWithoutRoot = warnSpy.mock.calls
      .map((call) => call.join(" "))
      .filter((message) => message.includes("inferred your workspace root"))

    warnSpy.mockClear()

    await loadConfig(PHASE_DEVELOPMENT_SERVER, projectDir, {
      customConfig: {
        ...withoutRootConfig,
        turbopack: {
          root: projectDir,
        },
      },
      silent: false,
      bundler: Bundler.Turbopack,
    })

    const warningsWithRoot = warnSpy.mock.calls
      .map((call) => call.join(" "))
      .filter((message) => message.includes("inferred your workspace root"))

    expect(fixtureRoot).not.toBe(projectDir)
    expect(warningsWithoutRoot).toHaveLength(1)
    expect(warningsWithoutRoot[0]).toContain("set `turbopack.root`")
    expect(warningsWithRoot).toEqual([])
  })
})
