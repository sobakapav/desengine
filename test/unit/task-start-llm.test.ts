// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Система выполняет start"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь запускает уровень через service boundary"

import { describe, expect, it, vi } from "vitest"

vi.mock("server-only", () => ({}))

import { taskStartLlm } from "../../lib/task/actions/start-llm"

const startOutputFiles = [
  { id: "component", fileName: "Component.tsx" },
  { id: "stories", fileName: "Component.stories.ts" },
  { id: "styles", fileName: "styles.ts" },
  { id: "mock", fileName: "mock.ts" },
]

describe("taskStartLlm.parsePayload", () => {
  it("чинит placeholder file id и имя файла через стартовые scaffolds", () => {
    const outputText = JSON.stringify({
      component: "component",
      stories: "Component.stories.ts",
      styles: "",
      mock: "",
    })

    const payload = taskStartLlm.parsePayload(outputText, startOutputFiles, {})

    expect(payload.component).toContain("export default function Component")
    expect(payload.stories).toContain('import Component from "./Component"')
    expect(payload.stories).toContain("export default { component: Component }")
    expect(payload.styles).toBe("export {};")
    expect(payload.mock).toBe("export const mock = {};")
  })

  it("сохраняет текущее содержимое файла, если placeholder пришёл для уже существующего компонента", () => {
    const outputText = JSON.stringify({
      component: "Component.tsx",
      stories: "Component.stories.ts",
      styles: "",
      mock: "",
    })

    const payload = taskStartLlm.parsePayload(outputText, startOutputFiles, {
      component: "export default function Component() { return <button>stable</button> }",
    })

    expect(payload.component).toContain("stable")
  })
})
