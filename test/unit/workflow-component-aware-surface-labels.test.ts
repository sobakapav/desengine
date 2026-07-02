// @openSpec capability: workflow
// @openSpec scenarios:
// @openSpec  - "Runtime surface может показать текущий workflow step через Workbench"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь видит проект задачи"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { findProjectComponentByTaskId } from "../../components/desengine/project/useTaskProjectComponent"
import { normalizeProjectComponent } from "../../lib/project/component-runtime"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("workflow component-aware surface labels", () => {
  it("находит project component по componentId даже если taskId является общим runtime-template", () => {
    const components = [
      normalizeProjectComponent({
        id: "component-a",
        projectId: "project-a",
        title: "Hero card",
        taskId: "component-workflow",
      }),
      normalizeProjectComponent({
        id: "component-b",
        projectId: "project-a",
        title: "Promo banner",
        taskId: "component-workflow",
      }),
    ]

    expect(findProjectComponentByTaskId(components, "task-banner", "component-b")?.title).toBe("Promo banner")
    expect(findProjectComponentByTaskId(components, "task-missing")).toBeNull()
  })

  it("подключает component-aware context к workbench и task surfaces", () => {
    const header = readProjectFile("components", "desengine", "lab", "Workbench", "WorkbenchHeader.tsx")
    const taskScreen = readProjectFile("components", "desengine", "task", "TaskScreen.tsx")
    const taskCard = readProjectFile("components", "desengine", "task", "TaskCard.tsx")
    const taskComponentContext = readProjectFile("components", "desengine", "project", "TaskProjectComponentContext.tsx")
    const resolverHook = readProjectFile("components", "desengine", "project", "useTaskProjectComponent.ts")

    expect(header).toContain("useTaskProjectComponent")
    expect(header).toContain("Компонент проекта:")
    expect(taskScreen).toContain("TaskProjectComponentContext")
    expect(taskCard).toContain("TaskProjectComponentContext")
    expect(taskComponentContext).toContain('mode = "compact"')
    expect(taskComponentContext).toContain("Компонент:")
    expect(taskComponentContext).toContain("Сейчас вы работаете над компонентом")
    expect(resolverHook).toContain("findProjectComponentByTaskId")
    expect(resolverHook).toContain("createBrowserProjectComponentStorage")
  })
})
