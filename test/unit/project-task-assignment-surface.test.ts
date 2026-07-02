// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает страницу проекта и попадает в рабочий контур проекта"
// @openSpec capability: navigation
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает `/tasks` или `/lab`"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project task assignment surface", () => {
  it("убирает task-слой из project page и перенаправляет старые индексные входы в проекты", () => {
    const tasksPage = readProjectFile("app", "tasks", "page.tsx")
    const labPage = readProjectFile("app", "lab", "page.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")

    expect(tasksPage).toContain('redirect(getProjectsRootUrl())')
    expect(labPage).toContain('redirect(getProjectsRootUrl())')
    expect(projectOverview).toContain("больше нет отдельного task-входа")
    expect(projectOverview).not.toContain("Связанные задачи")
    expect(projectOverview).not.toContain("Открыть задачу")
  })
})
