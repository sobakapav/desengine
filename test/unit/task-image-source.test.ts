// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь видит референс и результат"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"

import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

async function createTaskImageFixture() {
  const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "desengine-task-image-"))
  const taskRoot = path.join(fixtureRoot, "dipole-checkbox")
  await mkdir(taskRoot, { recursive: true })
  await writeFile(
    path.join(taskRoot, "base.png"),
    Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO7Z0mQAAAAASUVORK5CYII=", "base64"),
  )
  return { fixtureRoot, taskRoot }
}

describe("task image source", () => {
  beforeEach(() => {
    vi.resetModules()
  })

  afterEach(() => {
    vi.resetModules()
    vi.doUnmock("@/lib/user/server")
  })

  it("резолвит base image из каталога задачи", async () => {
    const { taskRoot } = await createTaskImageFixture()

    vi.doMock("@/lib/user/server", () => ({
      getTaskCatalogFilePath: (taskId: string, fileName: string) => path.join(path.dirname(taskRoot), taskId, fileName),
    }))

    const { resolveTaskImageAsset } = await import("../../lib/task/image-source")
    const asset = await resolveTaskImageAsset("dipole-checkbox", "base")

    expect(asset).not.toBeNull()
    expect(asset?.filePath).toBe(path.join(taskRoot, "base.png"))
    expect(asset?.contentType).toBe("image/png")
  })

  it("строит inline data url для лаборатории", async () => {
    const { taskRoot } = await createTaskImageFixture()

    vi.doMock("@/lib/user/server", () => ({
      getTaskCatalogFilePath: (taskId: string, fileName: string) => path.join(path.dirname(taskRoot), taskId, fileName),
    }))

    const { readTaskImageDataUrl } = await import("../../lib/task/image-source")
    const dataUrl = await readTaskImageDataUrl("dipole-checkbox", "base")

    expect(dataUrl).toBeTruthy()
    expect(dataUrl?.startsWith("data:image/png;base64,")).toBe(true)
  })
})
