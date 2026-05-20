// @openSpec capability: task
// @openSpec scenarios:
// @openSpec  - "Система читает статичную task-specific подсказку уровня"
// @openSpec  - "Система рендерит шаблонную task-specific подсказку уровня"
// @openSpec  - "Шаблонная task-specific подсказка учитывает выбранный UI kit проекта"
// @openSpec  - "Шаблонная подсказка имеет приоритет над статичной"
// @openSpec  - "Шаблон подсказки содержит ошибку"
// @openSpec  - "Подсказка уровня отсутствует"

import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { renderTaskHint } from "@/lib/task/hints"
import { normalizeProject, type Project } from "@/lib/project/runtime"
import type { LevelConfig } from "@/lib/level/types"
import type { TaskConfig } from "@/lib/task/types"

const level: LevelConfig = {
  id: "level-1",
  number: 1,
  title: "Первые состояния",
  description: "Описание уровня",
  layoutKey: "default",
  maxPromptsPerTask: 5,
  maxCheckAttempts: 3,
  labId: "level-1",
  images: [{ id: "base", show: true }],
  editableFileIds: ["component", "stories"],
}

const taskConfig: TaskConfig = {
  image: { width: 120, height: 48 },
  base: { width: 120, height: 48 },
  variants: null,
  images: {
    base: { width: 120, height: 48 },
  },
  maxLevel: 3,
}

async function createHintRoot() {
  const taskCatalogRoot = await mkdtemp(path.join(os.tmpdir(), "desengine-task-hints-"))
  const hintRoot = path.join(taskCatalogRoot, "task-1", "levels", "level-1")
  await mkdir(hintRoot, { recursive: true })
  return { taskCatalogRoot, hintRoot }
}

function renderTestHint(taskCatalogRoot: string, project?: Project) {
  return renderTaskHint({
    taskCatalogRoot,
    taskId: "task-1",
    level,
    taskConfig,
    project,
  })
}

describe("task hints", () => {
  it("читает старый tip.md как статичную подсказку", async () => {
    const { taskCatalogRoot, hintRoot } = await createHintRoot()
    await writeFile(path.join(hintRoot, "tip.md"), "  Статичная подсказка  \n", "utf-8")

    await expect(renderTestHint(taskCatalogRoot)).resolves.toBe("Статичная подсказка")
  })

  it("рендерит tip.njk через общий template runtime с task/level context", async () => {
    const { taskCatalogRoot, hintRoot } = await createHintRoot()
    await writeFile(
      path.join(hintRoot, "tip.njk"),
      "Задача {{ task.id }}, уровень {{ level.number }}: {{ level.title }}. Файлы: {{ level.editableFileIds | join(\", \") }}.",
      "utf-8",
    )

    await expect(renderTestHint(taskCatalogRoot)).resolves.toBe(
      "Задача task-1, уровень 1: Первые состояния. Файлы: component, stories.",
    )
  })

  it("передаёт выбранный UI kit проекта в template context", async () => {
    const { taskCatalogRoot, hintRoot } = await createHintRoot()
    const project = normalizeProject({
      id: "task-1-project",
      title: "Проект задачи",
      uiKitId: "ant",
      uiMode: "ui-kit",
    })
    await writeFile(
      path.join(hintRoot, "tip.njk"),
      "Выбран UI kit: {{ user.designSystemName }} / {{ project.uiKitTitle }}.",
      "utf-8",
    )

    await expect(renderTestHint(taskCatalogRoot, project)).resolves.toBe(
      "Выбран UI kit: Ant Design / Ant Design.",
    )
  })

  it("использует tip.njk перед tip.md", async () => {
    const { taskCatalogRoot, hintRoot } = await createHintRoot()
    await writeFile(path.join(hintRoot, "tip.md"), "Статичная подсказка", "utf-8")
    await writeFile(path.join(hintRoot, "tip.njk"), "Шаблонная подсказка для {{ task.maxLevel }} уровней", "utf-8")

    await expect(renderTestHint(taskCatalogRoot)).resolves.toBe("Шаблонная подсказка для 3 уровней")
  })

  it("возвращает raw template fallback при ошибке шаблона", async () => {
    const { taskCatalogRoot, hintRoot } = await createHintRoot()
    await writeFile(path.join(hintRoot, "tip.njk"), "До ошибки {% if task.id %}", "utf-8")

    await expect(renderTestHint(taskCatalogRoot)).resolves.toBe("До ошибки {% if task.id %}")
  })

  it("возвращает пустую строку, если подсказки нет", async () => {
    const { taskCatalogRoot } = await createHintRoot()

    await expect(renderTestHint(taskCatalogRoot)).resolves.toBe("")
  })
})
