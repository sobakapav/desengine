// @openSpec capability: projects
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает страницу проекта и видит его задачи"
// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Пользователь видит проект задачи"
// @openSpec  - "Пользователь возвращается из задачи в проект"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  filterTaskProjectBindingsForProject,
  indexTaskProjectBindings,
  type TaskProjectBinding,
} from "../../lib/task/assignment"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("project task assignment surface", () => {
  const bindings: TaskProjectBinding[] = [
    {
      taskId: "task-a",
      taskTitle: "task-a",
      projectId: "project-1",
      projectTitle: "Alpha",
      source: "stored-runtime",
    },
    {
      taskId: "task-b",
      taskTitle: "task-b",
      projectId: "project-2",
      projectTitle: "Beta",
      source: "stored-runtime",
    },
  ]

  it("фильтрует и индексирует двусторонние project/task связи без нового assignment shape", () => {
    expect(filterTaskProjectBindingsForProject(bindings, "project-1")).toEqual([bindings[0]])
    expect(indexTaskProjectBindings(bindings)).toEqual({
      "task-a": bindings[0],
      "task-b": bindings[1],
    })
  })

  it("подключает project binding к task surfaces и проектной странице", () => {
    const tasksPage = readProjectFile("app", "tasks", "page.tsx")
    const taskPage = readProjectFile("app", "tasks", "[taskId]", "page.tsx")
    const taskRoute = readProjectFile("app", "tasks", "assignments", "route.ts")
    const tasksScreen = readProjectFile("components", "desengine", "task", "TasksScreen.tsx")
    const taskCard = readProjectFile("components", "desengine", "task", "TaskCard.tsx")
    const taskScreen = readProjectFile("components", "desengine", "task", "TaskScreen.tsx")
    const projectOverview = readProjectFile("components", "desengine", "project", "ProjectOverviewScreen.tsx")
    const projectBindingsHook = readProjectFile("components", "desengine", "project", "useProjectTaskBindings.ts")

    expect(tasksPage).toContain("listTaskProjectBindings")
    expect(tasksPage).toContain("<TasksScreen tasks={tasks} bindings={bindings} />")

    expect(taskPage).toContain("getTaskProjectBinding(taskId)")
    expect(taskPage).toContain("taskItem={taskItem}")
    expect(taskPage).toContain("binding={binding}")

    expect(taskRoute).toContain("requireAccessOrUnauthorizedResponse")
    expect(taskRoute).toContain("filterTaskProjectBindingsForProject")

    expect(tasksScreen).toContain("С проектом уже связаны")
    expect(taskCard).toContain("Проект:")
    expect(taskCard).toContain("Открыть работу")
    expect(taskCard).toContain("getProjectUrl(binding.projectId)")
    expect(taskScreen).toContain("Связанный проект")
    expect(taskScreen).toContain("Открыть проект")
    expect(taskScreen).toContain("Открыть работу")

    expect(projectOverview).toContain("Как здесь идёт работа")
    expect(projectOverview).toContain("Связанные задачи")
    expect(projectOverview).toContain("Открыть задачу")
    expect(projectBindingsHook).toContain("fetch(`/tasks/assignments?projectId=${encodeURIComponent(projectId)}`")
  })
})
