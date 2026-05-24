// @openSpec capability: external-local-onboarding
// @openSpec scenarios:
// @openSpec  - "Пользователь проходит новую установку по шаблонной конфигурации"
// @openSpec capability: onboarding-repo
// @openSpec scenarios:
// @openSpec  - "Пользователь хочет повторно обновить onboarding-контент"

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("node:fs/promises", async () => {
  const actual = await vi.importActual<typeof import("node:fs/promises")>("node:fs/promises")
  return {
    ...actual,
    access: vi.fn(),
    cp: vi.fn(),
    rename: vi.fn(),
    rm: vi.fn(),
  }
})

import * as fsPromises from "node:fs/promises"

describe("replaceDirectory", () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("переходит на copy fallback при EXDEV", async () => {
    vi.mocked(fsPromises.access).mockRejectedValueOnce(new Error("missing"))
    vi.mocked(fsPromises.rename).mockRejectedValueOnce(
      Object.assign(new Error("Cross-device link not permitted"), { code: "EXDEV" }),
    )

    const { replaceDirectory } = await import("@/lib/onboarding/replace-directory")

    await replaceDirectory("/tmp/source-onboarding", "/tmp/target-onboarding")

    expect(fsPromises.cp).toHaveBeenCalledWith("/tmp/source-onboarding", "/tmp/target-onboarding", {
      recursive: true,
      force: true,
    })
    expect(fsPromises.rm).toHaveBeenCalledWith("/tmp/source-onboarding", {
      recursive: true,
      force: true,
    })
  })

  it("не маскирует ошибки rename, не связанные с EXDEV", async () => {
    const permissionError = Object.assign(new Error("EACCES"), { code: "EACCES" })
    vi.mocked(fsPromises.access).mockRejectedValueOnce(new Error("missing"))
    vi.mocked(fsPromises.rename).mockRejectedValueOnce(permissionError)

    const { replaceDirectory } = await import("@/lib/onboarding/replace-directory")

    await expect(replaceDirectory("/tmp/source-onboarding", "/tmp/target-onboarding")).rejects.toBe(permissionError)
    expect(fsPromises.cp).not.toHaveBeenCalled()
  })
})
