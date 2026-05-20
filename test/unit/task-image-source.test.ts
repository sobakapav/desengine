// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import { describe, expect, it } from "vitest"

import { readTaskImageDataUrl, resolveTaskImageAsset } from "../../lib/task/image-source"

describe("task image source", () => {
  it("резолвит base image из каталога задачи", async () => {
    const asset = await resolveTaskImageAsset("dipole-checkbox", "base")

    expect(asset).not.toBeNull()
    expect(asset?.filePath.endsWith("/onboarding/tasks/dipole-checkbox/base.png")).toBe(true)
    expect(asset?.contentType).toBe("image/png")
  })

  it("строит inline data url для лаборатории", async () => {
    const dataUrl = await readTaskImageDataUrl("dipole-checkbox", "base")

    expect(dataUrl).toBeTruthy()
    expect(dataUrl?.startsWith("data:image/png;base64,")).toBe(true)
  })
})
