// @openSpec capability: llm
// @openSpec scenarios:
// @openSpec  - "Система выполняет start"
// @openSpec  - "Базовый prompt описывает безопасный путь для preview по умолчанию"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Sandpack preview использует project.uiKitId"
// @openSpec  - "Task-specific подсказка не требует неподдерживаемый preview runtime"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { buildSandpackPreviewPayload } from "../../lib/lab/sandpack-preview"

const unsupportedPromptComponents = [
  "Link",
  "Image",
  "Script",
  "Head",
  "Route",
  "Routes",
  "Outlet",
  "Navigate",
]

const unsupportedRuntimePackages = [
  "next",
  "next/link",
  "next/image",
  "next/script",
  "next/head",
  "react-router",
  "react-router-dom",
]

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("prompt component guidance runtime parity", () => {
  it("общий guidance не рекламирует next/router-компоненты как безопасный дефолт preview", () => {
    const partial = readProjectFile(
      "onboarding",
      "prompts",
      "partials",
      "default-allowed-components.njk",
    )

    expect(partial).toContain("Fragment")
    expect(partial).toContain('"@/components/ui/"')
    expect(partial).toContain("Стандартные HTML-теги использовать можно")

    for (const componentName of unsupportedPromptComponents) {
      expect(partial).not.toMatch(new RegExp(`\\b${componentName}\\b`))
    }
  })

  it("дефолтный Sandpack runtime не притворяется Next/router-окружением", () => {
    const payload = buildSandpackPreviewPayload({
      component: `export default function Component() {
  return <div>Preview</div>;
}
`,
      uiBadge: "export function Badge() { return null }\n",
      systemUtils: "export function cn() { return \"\" }\n",
    })

    expect(payload.customSetup.environment).toBe("create-react-app")

    for (const packageName of unsupportedRuntimePackages) {
      expect(payload.customSetup.dependencies[packageName]).toBeUndefined()
    }
  })

  it("task hint для mp-inspector-mobile-subject-actions не требует неподдерживаемый Link", () => {
    const tip = readProjectFile(
      "onboarding",
      "tasks",
      "mp-inspector-mobile-subject-actions",
      "levels",
      "level-2",
      "tip.md",
    )

    expect(tip).not.toContain("<Link>")
    expect(tip).not.toContain("nextjs.org/docs")
    expect(tip).toContain("семантика имеет значение")
    expect(tip).toContain("обычная ссылка `<a>`")
  })
})
