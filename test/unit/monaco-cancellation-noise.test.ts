// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает рабочий экран на desktop"
// @openSpec  - "Monaco штатно отменяет внутреннюю async-операцию"

import { describe, expect, it } from "vitest"

import { isMonacoCancellationNoise } from "@/components/desengine/lab/Code/MonacoCodeEditor"

describe("Monaco cancellation noise filter", () => {
  it("подавляет только характерную Monaco cancellation rejection", () => {
    expect(
      isMonacoCancellationNoise({
        name: "Canceled",
        message: "Canceled",
        stack: "Error: Canceled\n    at https://cdn.example/monaco-editor/vs/base/common/cancellation.js:1:1",
      }),
    ).toBe(true)
  })

  it("не подавляет другие rejection причины", () => {
    expect(
      isMonacoCancellationNoise({
        name: "Error",
        message: "Canceled",
        stack: "Error: Canceled\n    at app/runtime.ts:10:2",
      }),
    ).toBe(false)

    expect(
      isMonacoCancellationNoise({
        name: "Canceled",
        message: "Canceled",
        stack: "Error: Canceled\n    at app/runtime.ts:10:2",
      }),
    ).toBe(false)

    expect(isMonacoCancellationNoise("Canceled: Canceled")).toBe(false)
    expect(isMonacoCancellationNoise(new Error("Canceled"))).toBe(false)
  })
})
