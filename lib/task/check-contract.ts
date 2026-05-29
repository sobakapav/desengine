import "server-only"

import { access, readFile } from "node:fs/promises"
import path from "node:path"

import { renderPromptTemplateFromRoot } from "@/lib/prompt/render/server"
import type { Project } from "@/lib/project/runtime"

import type { LevelConfig } from "../level/types"
import type { TaskConfig } from "./types"
import { buildTaskPromptContext } from "./prompt-context"

const taskCheckContractOverrides: Record<string, string> = {
  "otvinta-badge-counter:level-1": [
    "Это task-specific hidden check contract для `otvinta-badge-counter`, уровень 1.",
    "",
    "Обязательный результат:",
    "- На компоненте должен быть один круглый badge counter.",
    "- Счётчик должен выглядеть как самостоятельный круглый индикатор, а не как фон картинки.",
    "- В счётчик должно помещаться любое число от `0` до `99`.",
    "",
    "Запрещённые домыслы:",
    "- Нельзя требовать колокольчик, иконку уведомлений или любой другой отдельный элемент, которого нет на `base.png` и `variants.png`.",
    "- Нельзя считать обязательными декоративные детали, которых нет в task tip и на референсах.",
    "",
    "Порядок основной причины провала:",
    "1. Нет круглого badge counter или он не читается как круглый индикатор.",
    "2. Badge counter не рассчитан на диапазон `0..99`.",
    "3. Только после этого можно указывать другие расхождения, если они прямо следуют из этого контракта и видимы на референсах.",
  ].join("\n"),
}

type TaskCheckContractRenderInput = {
  taskCatalogRoot: string
  taskId: string
  level: LevelConfig
  taskConfig: TaskConfig
  project?: Project
}

async function pathExists(filePath: string) {
  try {
    await access(filePath)
    return true
  } catch {
    return false
  }
}

async function renderTemplate(root: string, templateName: string, input: TaskCheckContractRenderInput) {
  const rendered = await renderPromptTemplateFromRoot(
    root,
    templateName,
    buildTaskPromptContext({
      taskId: input.taskId,
      taskMaxLevel: input.taskConfig.maxLevel,
      taskImages: input.taskConfig.images,
      level: input.level,
      project: input.project,
    }),
    { onErrorFallbackToRaw: true },
  )

  return rendered.trim()
}

async function readStatic(filePath: string) {
  return (await readFile(filePath, "utf-8")).trim()
}

export async function renderTaskCheckContract(input: TaskCheckContractRenderInput) {
  const overrideKey = `${input.taskId}:${input.level.id}`
  const trackedOverride = taskCheckContractOverrides[overrideKey]
  if (trackedOverride) {
    return trackedOverride
  }

  const root = path.join(input.taskCatalogRoot, input.taskId, "levels", input.level.id)
  const tipTemplatePath = path.join(root, "tip.njk")
  if (await pathExists(tipTemplatePath)) {
    return renderTemplate(root, "tip.njk", input)
  }

  const tipStaticPath = path.join(root, "tip.md")
  if (await pathExists(tipStaticPath)) {
    return readStatic(tipStaticPath)
  }

  return ""
}
