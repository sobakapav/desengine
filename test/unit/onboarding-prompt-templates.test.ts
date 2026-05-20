import path from "node:path"

import { describe, expect, it } from "vitest"

import { renderPromptTemplateFromRoot } from "@/lib/prompt/render/server"

describe("onboarding prompt templates (nunjucks)", () => {
  it("didactic default рендерится без ведущего перевода строки и не меняет текст", async () => {
    const root = path.join(process.cwd(), "onboarding", "prompts")

    const out = await renderPromptTemplateFromRoot(root, "default.njk", {}, { required: true })

    expect(out.startsWith("\n")).toBe(false)
    expect(out).toContain("## Общие ожидания к коду")
    expect(out).toContain("Важно: верни результат строго в формате JSON")
  })

  it("level-1 start рендерится без ведущего перевода строки и включает общие partials", async () => {
    const root = path.join(process.cwd(), "onboarding", "prompts")

    const out = await renderPromptTemplateFromRoot(root, path.join("levels", "level-1", "start.njk"), {}, { required: true })

    expect(out.startsWith("\n")).toBe(false)
    expect(out).toContain("## Приоритеты")
    expect(out).toContain("использовать компоненты из React/Next.js запрещено")
  })

  it("level-2 check сохраняет параграфы и разрешение lucide-react", async () => {
    const root = path.join(process.cwd(), "onboarding", "prompts")

    const out = await renderPromptTemplateFromRoot(root, path.join("levels", "level-2", "check.njk"), {}, { required: true })

    expect(out.startsWith("\n")).toBe(false)
    expect(out).toContain("Если в коде есть только HTML — задача не решена.")
    expect(out).toContain("\n\nБиблиотека lucide-react разрешена к использованию.")
  })

  it("level-3 iterate рендерится без ведущего перевода строки", async () => {
    const root = path.join(process.cwd(), "onboarding", "prompts")

    const out = await renderPromptTemplateFromRoot(root, path.join("levels", "level-3", "iterate.njk"), {}, { required: true })

    expect(out.startsWith("\n")).toBe(false)
    expect(out).toContain("Приоритеты:")
  })
})
