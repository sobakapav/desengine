import { describe, expect, it } from "vitest"

import { resolvePreviewClientId } from "@/components/desengine/lab/InOut/preview-client-id"

describe("preview client id contract", () => {
  it("не затирает уже полученный clientId транзитным null от ref lifecycle", () => {
    expect(resolvePreviewClientId("preview-1", null)).toBe("preview-1")
  })

  it("не создаёт лишнего обновления на том же clientId", () => {
    expect(resolvePreviewClientId("preview-1", "preview-1")).toBe("preview-1")
  })

  it("принимает новый clientId после смены preview runtime", () => {
    expect(resolvePreviewClientId("preview-1", "preview-2")).toBe("preview-2")
  })

  it("разрешает первичную инициализацию из пустого состояния", () => {
    expect(resolvePreviewClientId(null, "preview-1")).toBe("preview-1")
  })
})
