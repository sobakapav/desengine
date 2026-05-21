// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

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

      expect(appConfig.taskCatalogRoot).toBe(path.join(originalCwd, "onboarding", "tasks"))
    } finally {
      process.chdir(originalCwd)
    }
  })
})
