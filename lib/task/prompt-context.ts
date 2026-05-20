import "server-only"

import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config"
import { createDefaultProject, resolveProjectPreviewConfig, type Project } from "@/lib/project/runtime"

import type { LevelConfig } from "../level/types"
import type { PromptRenderContext } from "../prompt/types"

type BuildTaskPromptContextInput = {
  taskId: string
  taskMaxLevel: number
  taskImages: unknown
  level: Pick<LevelConfig, "id" | "number" | "title" | "labId" | "editableFileIds">
  project?: Project
}

function buildTaskPromptContext(input: BuildTaskPromptContextInput): PromptRenderContext {
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
      maxLevel: input.taskMaxLevel,
      images: input.taskImages,
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

export {
  buildTaskPromptContext,
  type BuildTaskPromptContextInput,
}
