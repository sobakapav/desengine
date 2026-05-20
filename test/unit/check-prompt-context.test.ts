import { mkdtemp, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import type { LevelConfig } from "@/lib/level/types"
import { renderPromptTemplateFromRoot } from "@/lib/prompt/render/server"
import { normalizeProject } from "@/lib/project/runtime"
import { buildTaskPromptContext } from "@/lib/task/prompt-context"

const level: Pick<LevelConfig, "id" | "number" | "title" | "labId" | "editableFileIds"> = {
  id: "level-2",
  number: 2,
  title: "Проверка уровня",
  labId: "level-2",
  editableFileIds: ["component"],
}

describe("check prompt context", () => {
  it("рендерит реальный onboarding check prompt уровня 2 с user.designSystemName", async () => {
    const root = path.join(process.cwd(), "onboarding", "prompts")
    const context = buildTaskPromptContext({
      taskId: "task-1",
      taskMaxLevel: 3,
      taskImages: null,
      level,
      project: normalizeProject({
        id: "task-1",
        title: "Проект задачи",
        uiKitId: "ant",
        uiMode: "ui-kit",
      }),
    })

    const out = await renderPromptTemplateFromRoot(root, path.join("levels", "level-2", "check.njk"), context, {
      required: true,
    })

    expect(out).toContain("UI-библиотеки Ant Design")
    expect(out).not.toContain("UI-библиотеки .")
    expect(out).not.toContain("{{ user.designSystemName }}")
  })

  it("передаёт название выбранной дизайн-системы в hidden check prompt", async () => {
    const root = await mkdtemp(path.join(os.tmpdir(), "desengine-check-prompt-"))
    const context = buildTaskPromptContext({
      taskId: "task-1",
      taskMaxLevel: 3,
      taskImages: null,
      level,
      project: normalizeProject({
        id: "task-1",
        title: "Проект задачи",
        uiKitId: "ant",
        uiMode: "ui-kit",
      }),
    })
    await writeFile(path.join(root, "check.njk"), "UI kit: {{ user.designSystemName }} / {{ project.uiKitTitle }}", "utf-8")

    await expect(renderPromptTemplateFromRoot(root, "check.njk", context, { required: true })).resolves.toBe(
      "UI kit: Ant Design / Ant Design",
    )
  })

  it("использует effective UI kit для html-tags режима", () => {
    const context = buildTaskPromptContext({
      taskId: "task-1",
      taskMaxLevel: 3,
      taskImages: null,
      level,
      project: normalizeProject({
        id: "task-1",
        title: "Проект задачи",
        uiKitId: "mui",
        uiMode: "html-tags",
      }),
    })

    expect(context.user?.designSystemId).toBe("none")
    expect(context.user?.designSystemName).toBe("Только React")
    expect((context.project as { effectiveUiKitId?: string }).effectiveUiKitId).toBe("none")
  })

  it("стабильно строит fallback context без явного project", () => {
    const context = buildTaskPromptContext({
      taskId: "task-1",
      taskMaxLevel: 3,
      taskImages: null,
      level,
    })

    expect(context.user?.designSystemId).toBe("shadcn")
    expect(context.user?.designSystemName).toBe("shadcn/ui")
    expect((context.task as { maxLevel?: number }).maxLevel).toBe(3)
  })
})
