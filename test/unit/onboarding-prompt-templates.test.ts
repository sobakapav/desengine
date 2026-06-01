import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import path from "node:path"
import os from "node:os"
import { pathToFileURL } from "node:url"

import { describe, expect, it } from "vitest"

import { validateOnboardingLayout as validateRuntimeOnboardingLayout } from "@/lib/onboarding/server"
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

  it("level-3 check требует канонический styles.ts", async () => {
    const root = path.join(process.cwd(), "onboarding", "prompts")

    const out = await renderPromptTemplateFromRoot(root, path.join("levels", "level-3", "check.njk"), {}, { required: true })

    expect(out.startsWith("\n")).toBe(false)
    expect(out).toContain("`Component.tsx` и `styles.ts`")
    expect(out).not.toContain("style.ts")
  })
})

describe("onboarding layout validators", () => {
  async function importSmokeValidator() {
    const smokeModuleUrl = pathToFileURL(
      path.join(process.cwd(), "tools", "smoke-local-install", "onboarding.mjs"),
    ).href

    return import(smokeModuleUrl) as Promise<{
      validateOnboardingLayout: (rootDir: string, root: string) => Promise<{ ok: boolean; detail: string }>
      inspectOnboardingState: (
        rootDir: string,
        repoUrl: string,
      ) => Promise<{ state: "missing" | "unconfirmed" | "synced"; detail: string }>
    }>
  }

  async function importRepairValidator() {
    const repairModuleUrl = pathToFileURL(
      path.join(process.cwd(), "tools", "repair-onboarding.mjs"),
    ).href

    return import(repairModuleUrl) as Promise<{
      validateOnboardingLayout: (root: string) => Promise<void>
    }>
  }

  async function createOnboardingFixture({
    promptFileName,
  }: {
    promptFileName: "default.njk" | "default.md"
  }) {
    const fixtureRoot = await mkdtemp(path.join(os.tmpdir(), "desengine-onboarding-layout-"))
    const onboardingRoot = path.join(fixtureRoot, "onboarding")

    await mkdir(path.join(onboardingRoot, "levels", "level-1"), { recursive: true })
    await mkdir(path.join(onboardingRoot, "tasks", "task-1"), { recursive: true })
    await mkdir(path.join(onboardingRoot, "prompts", "levels"), { recursive: true })
    await writeFile(path.join(onboardingRoot, "prompts", promptFileName), "prompt", "utf-8")

    return { fixtureRoot, onboardingRoot }
  }

  async function writeSmokeConfig(fixtureRoot: string) {
    await writeFile(
      path.join(fixtureRoot, "desengine.config.json"),
      `${JSON.stringify({ onboardingRoot: "onboarding" }, null, 2)}\n`,
      "utf-8",
    )
  }

  it("runtime, smoke и repair принимают layout с canonical default.njk", async () => {
    const { validateOnboardingLayout: validateSmokeOnboardingLayout } = await importSmokeValidator()
    const { validateOnboardingLayout: validateRepairOnboardingLayout } = await importRepairValidator()
    const { onboardingRoot, fixtureRoot } = await createOnboardingFixture({ promptFileName: "default.njk" })

    await expect(validateRuntimeOnboardingLayout(onboardingRoot)).resolves.toMatchObject({ ok: true })
    await expect(validateSmokeOnboardingLayout(fixtureRoot, onboardingRoot)).resolves.toMatchObject({ ok: true })
    await expect(validateRepairOnboardingLayout(onboardingRoot)).resolves.toBeUndefined()
  })

  it("runtime, smoke и repair отвергают legacy-only layout с default.md", async () => {
    const { validateOnboardingLayout: validateSmokeOnboardingLayout } = await importSmokeValidator()
    const { validateOnboardingLayout: validateRepairOnboardingLayout } = await importRepairValidator()
    const { onboardingRoot, fixtureRoot } = await createOnboardingFixture({ promptFileName: "default.md" })

    await expect(validateRuntimeOnboardingLayout(onboardingRoot)).resolves.toMatchObject({
      ok: false,
      message: expect.stringContaining("default.njk"),
    })
    await expect(validateSmokeOnboardingLayout(fixtureRoot, onboardingRoot)).resolves.toMatchObject({
      ok: false,
      detail: expect.stringContaining("default.njk"),
    })
    await expect(validateRepairOnboardingLayout(onboardingRoot)).rejects.toThrow(/default\.njk/)
  })

  it("inspectOnboardingState не считает synced layout без canonical default.njk даже при валидном marker", async () => {
    const { inspectOnboardingState } = await importSmokeValidator()
    const repoUrl = "https://example.com/onboarding.git"
    const { onboardingRoot, fixtureRoot } = await createOnboardingFixture({ promptFileName: "default.md" })

    await writeSmokeConfig(fixtureRoot)
    await writeFile(
      path.join(onboardingRoot, ".desengine-onboarding-source.json"),
      `${JSON.stringify({ repoUrl, syncedAt: "2026-06-01T00:00:00.000Z", commitHash: "abc123" }, null, 2)}\n`,
      "utf-8",
    )

    await expect(inspectOnboardingState(fixtureRoot, repoUrl)).resolves.toMatchObject({
      state: "missing",
      detail: expect.stringContaining("default.njk"),
    })
  })

  it("inspectOnboardingState подтверждает synced только для полного layout с canonical default.njk", async () => {
    const { inspectOnboardingState } = await importSmokeValidator()
    const repoUrl = "https://example.com/onboarding.git"
    const { onboardingRoot, fixtureRoot } = await createOnboardingFixture({ promptFileName: "default.njk" })

    await writeSmokeConfig(fixtureRoot)
    await writeFile(
      path.join(onboardingRoot, ".desengine-onboarding-source.json"),
      `${JSON.stringify({ repoUrl, syncedAt: "2026-06-01T00:00:00.000Z", commitHash: "abc123" }, null, 2)}\n`,
      "utf-8",
    )

    await expect(inspectOnboardingState(fixtureRoot, repoUrl)).resolves.toMatchObject({
      state: "synced",
      detail: expect.stringContaining("abc123"),
    })
  })
})
