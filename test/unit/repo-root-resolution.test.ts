// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import path from "node:path"

import { describe, expect, it } from "vitest"

describe("repo root resolution", () => {
  it("не привязывает repoRoot к .next в сборке", async () => {
    const originalCwd = process.cwd()

    try {
      // Имитируем ситуацию, когда server-side код исполняется из каталога `.next/...`.
      process.chdir(path.join(originalCwd, ".next"))

      const module = await import("../../lib/system/config/server")
      const { appConfig } = module

      expect(appConfig.taskCatalogRoot).toBe(path.join(originalCwd, "onboarding", "tasks"))
    } finally {
      process.chdir(originalCwd)
    }
  })
})

