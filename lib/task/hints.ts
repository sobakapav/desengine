import "server-only"

import { access, readFile } from "node:fs/promises"
import path from "node:path"

import { renderPromptTemplateFromRoot } from "@/lib/prompt/render/server"
import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config"
import { createDefaultProject, resolveProjectPreviewConfig, type Project } from "@/lib/project/runtime"

import type { LevelConfig } from "../level/types"
import type { PromptRenderContext } from "../prompt/types"
import type { TaskConfig } from "./types"

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

function buildTaskHintContext(input: TaskHintRenderInput): PromptRenderContext {
  const project = input.project ?? createDefaultProject(`task-${input.taskId}`)
  const previewProject = resolveProjectPreviewConfig(project)
  const selectedUiKit = sandpackUiKitsConfig[project.uiKitId]
  const effectiveUiKit = sandpackUiKitsConfig[previewProject.effectiveUiKitId]

  return {
    user: {
      designSystemId: effectiveUiKit.id,
      designSystemName: effectiveUiKit.title,
    },
    task: {
      id: input.taskId,
      maxLevel: input.taskConfig.maxLevel,
      images: input.taskConfig.images,
    },
    level: {
      id: input.level.id,
      number: input.level.number,
      title: input.level.title,
      labId: input.level.labId,
      editableFileIds: input.level.editableFileIds,
    },
    project: {
      id: project.id,
      title: project.title,
      uiKitId: project.uiKitId,
      uiKitTitle: selectedUiKit.title,
      uiMode: project.uiMode,
      effectiveUiKitId: effectiveUiKit.id,
      effectiveUiKitTitle: effectiveUiKit.title,
    },
  }
}

export async function renderTaskHint(input: TaskHintRenderInput) {
  const hintRoot = path.join(input.taskCatalogRoot, input.taskId, "levels", input.level.id)
  const templatePath = path.join(hintRoot, "tip.njk")

  if (await pathExists(templatePath)) {
    const rendered = await renderPromptTemplateFromRoot(
      hintRoot,
      "tip.njk",
      buildTaskHintContext(input),
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
