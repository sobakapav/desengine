import "server-only"

import { access, readFile } from "node:fs/promises"
import path from "node:path"

import { renderPromptTemplateFromRoot } from "@/lib/prompt/render/server"
import type { Project } from "@/lib/project/runtime"

import type { LevelConfig } from "../level/types"
import type { TaskConfig } from "./types"
import { buildTaskPromptContext } from "./prompt-context"

type TaskHintRenderInput = {
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

export async function renderTaskHint(input: TaskHintRenderInput) {
  const hintRoot = path.join(input.taskCatalogRoot, input.taskId, "levels", input.level.id)
  const templatePath = path.join(hintRoot, "tip.njk")

  if (await pathExists(templatePath)) {
    const rendered = await renderPromptTemplateFromRoot(
      hintRoot,
      "tip.njk",
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

  const staticPath = path.join(hintRoot, "tip.md")

  try {
    return (await readFile(staticPath, "utf-8")).trim()
  } catch (error) {
    if (
      typeof error === "object"
      && error !== null
      && "code" in error
      && error.code === "ENOENT"
    ) {
      return ""
    }

    throw error
  }
}
