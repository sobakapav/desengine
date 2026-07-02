import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

describe("repo root resolution", () => {
  it("не привязывает repoRoot к .next в сборке", async () => {
    const originalCwd = process.cwd()
    const nextDir = path.join(originalCwd, ".next")

    try {
      // Имитируем ситуацию, когда server-side код исполняется из каталога `.next/...`.
      fs.mkdirSync(nextDir, { recursive: true })
      process.chdir(nextDir)

      const module = await import("../../lib/system/config/server")
      const { appConfig } = module

      expect(appConfig.promptsRoot).toBe(path.join(originalCwd, "prompts"))
    } finally {
      process.chdir(originalCwd)
    }
  })
})
