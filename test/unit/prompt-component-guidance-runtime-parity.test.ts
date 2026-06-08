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
  it("repo-owned prompt guidance не рекламирует next/router-компоненты как безопасный дефолт preview", () => {
    const defaultPrompt = readProjectFile("prompts", "default.njk")
    const iteratePrompt = readProjectFile("prompts", "iterate-component.njk")
    const commonRules = readProjectFile("prompts", "partials", "common-rules.njk")

    expect(commonRules).toContain("не используй внешние зависимости, кроме React")
    expect(commonRules).toContain("Tailwind CSS допустим")
    expect(iteratePrompt).toContain("`styles.ts`")

    for (const componentName of unsupportedPromptComponents) {
      expect(defaultPrompt).not.toMatch(new RegExp(`\\b${componentName}\\b`))
      expect(iteratePrompt).not.toMatch(new RegExp(`\\b${componentName}\\b`))
    }
  })

  it("дефолтный Sandpack runtime не притворяется Next/router-окружением", async () => {
    const payload = await buildSandpackPreviewPayload({
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

  it("repo-owned prompt guidance не требует неподдерживаемый Link", () => {
    const defaultPrompt = readProjectFile("prompts", "default.njk")
    const startPrompt = readProjectFile("prompts", "start-component.njk")

    expect(defaultPrompt).not.toContain("<Link>")
    expect(defaultPrompt).not.toContain("nextjs.org/docs")
    expect(startPrompt).not.toContain("<Link>")
    expect(startPrompt).not.toContain("nextjs.org/docs")
  })
})
