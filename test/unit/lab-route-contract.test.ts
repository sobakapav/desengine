// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Пользователь открывает лабораторию уровня"
// @openSpec  - "Пользователь открывает рабочий экран на desktop"
// @openSpec  - "Пользователь открывает рабочую задачу лаборатории"
// @openSpec  - "Пользователь открывает рабочий файл задачи"
// @openSpec  - "Legacy route ведёт к transition экрану"
// @openSpec capability: task-levels
// @openSpec scenarios:
// @openSpec  - "У задачи есть следующий уровень"
// @openSpec  - "Пользователь завершил максимальный уровень задачи"
// @openSpec  - "Пользователь открывает результат проверки по каноническому route"

import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { getDefaultCodeScreen } from "../../lib/lab/editor"
import { getLabRootUrl, getLabUrl } from "../../lib/lab/navigation"
import {
  createLabLegacyTransitionRedirectPath,
  createLabUrl,
  createTaskCheckPath,
  createTaskDonePath,
  createTaskNextPath,
  createTaskTransitionPath,
  getTaskUrl,
  getTasksRootUrl,
  isAccessibleTaskScreen,
  isTaskTransitionScreen,
  taskTransitionScreens,
} from "../../lib/system/navigation"

function readProjectFile(...segments: string[]) {
  return fs.readFileSync(path.join(process.cwd(), ...segments), "utf8")
}

describe("lab route contract", () => {
  it("строит canonical рабочий URL лаборатории через единый helper", () => {
    const taskId = "task id/1"
    const encodedTaskId = "task%20id%2F1"
    const defaultScreen = getDefaultCodeScreen()

    expect(getLabRootUrl()).toBe("/lab")
    expect(getLabUrl(taskId)).toBe(`/lab/${encodedTaskId}`)
    expect(getLabUrl(taskId, null)).toBe(`/lab/${encodedTaskId}`)
    expect(getLabUrl(taskId, defaultScreen)).toBe(`/lab/${encodedTaskId}`)
    expect(createLabUrl(taskId)).toBe(`/lab/${encodedTaskId}`)
  })

  it("строит canonical URL рабочего файла и проверяет screen по allowlist", () => {
    const taskId = "task id/1"

    expect(createLabUrl(taskId, "component.tsx")).toBe("/lab/task%20id%2F1/component.tsx")
    expect(isAccessibleTaskScreen("component.tsx", ["component.tsx"])).toBe(true)
    expect(isAccessibleTaskScreen("component.tsx", ["readme.md"])).toBe(false)
    expect(isAccessibleTaskScreen(getDefaultCodeScreen(), [])).toBe(true)
  })

  it("строит canonical transition paths для task flow без несуществующего /tasks/<taskId>/next", () => {
    const taskId = "task id/1"

    expect(getTasksRootUrl()).toBe("/tasks")
    expect(getTaskUrl(taskId)).toBe("/tasks/task%20id%2F1")
    expect(taskTransitionScreens).toEqual(["check", "done", "next"])
    expect(createTaskCheckPath(taskId)).toBe("/tasks/task%20id%2F1/check")
    expect(createTaskDonePath(taskId)).toBe("/tasks/task%20id%2F1/done")
    expect(createTaskNextPath(taskId)).toBe("/lab/task%20id%2F1")
    expect(createTaskTransitionPath(taskId, "check")).toBe(createTaskCheckPath(taskId))
    expect(createTaskTransitionPath(taskId, "done")).toBe(createTaskDonePath(taskId))
    expect(createTaskTransitionPath(taskId, "next")).toBe(createTaskNextPath(taskId))
    expect(isTaskTransitionScreen("check")).toBe(true)
    expect(isTaskTransitionScreen("done")).toBe(true)
    expect(isTaskTransitionScreen("next")).toBe(true)
    expect(isTaskTransitionScreen("component.tsx")).toBe(false)
  })

  it("legacy lab routes используют явный compatibility redirect helper", () => {
    const expectedRedirects = {
      check: "/tasks/task%20id%2F1/check",
      done: "/tasks/task%20id%2F1/done",
      next: "/lab/task%20id%2F1",
    } as const

    for (const screen of taskTransitionScreens) {
      const source = readProjectFile("app", "lab", "[taskId]", screen, "page.tsx")

      expect(createLabLegacyTransitionRedirectPath("task id/1", screen)).toBe(expectedRedirects[screen])
      expect(source).toContain("createLabLegacyTransitionRedirectPath")
      expect(source).toContain(`createLabLegacyTransitionRedirectPath(taskId, "${screen}")`)
      expect(source).toContain("redirect(canonicalPath)")
      expect(source).not.toContain('"/tasks/')
      expect(source).not.toContain("`/tasks/")
    }
  })
})
