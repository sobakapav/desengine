import type { Artifact } from "./model"
import type { TaskCheckResult, TaskData } from "./types"
import type { TaskProjectionWorkbenchFile } from "./workflow-points"

export function buildFileArtifacts(args: {
  contentByFileId: Record<string, string>
  workbenchFiles: TaskProjectionWorkbenchFile[]
  projectId: string
  taskId: string
  createdAt: string
}): Artifact[] {
  const filesById = new Map(args.workbenchFiles.map((file) => [file.id, file] as const))

  return Object.entries(args.contentByFileId).map(([fileId, content]) => {
    const file = filesById.get(fileId)

    return {
      id: `artifact:${args.taskId}:file:${fileId}`,
      projectId: args.projectId,
      taskId: args.taskId,
      kind: "code-file",
      uri: file?.fileName ? `task-file://${args.taskId}/${file.fileName}` : `task-file://${args.taskId}/${fileId}`,
      data: {
        fileId,
        fileName: file?.fileName ?? fileId,
        title: file?.title ?? fileId,
        editable: file?.edit ?? false,
        content,
      },
      createdAt: args.createdAt,
    }
  })
}

export function buildPromptArtifacts(args: {
  taskData: TaskData
  projectId: string
  createdAt: string
}): Artifact[] {
  return args.taskData.promptHistory.map((entry, index) => ({
    id: `artifact:${args.taskData.taskId}:prompt:${index + 1}`,
    projectId: args.projectId,
    taskId: args.taskData.taskId,
    kind: "prompt-entry",
    data: {
      ...entry,
      promptIndex: index + 1,
    },
    createdAt: entry.createdAt || args.createdAt,
  }))
}

export function buildCheckResultArtifact(args: {
  checkResult?: TaskCheckResult | null
  projectId: string
  taskId: string
  createdAt: string
}): Artifact[] {
  if (!args.checkResult) return []

  return [
    {
      id: `artifact:${args.taskId}:check-result:${args.checkResult.levelNumber}`,
      projectId: args.projectId,
      taskId: args.taskId,
      kind: "check-result",
      data: args.checkResult,
      createdAt: args.checkResult.createdAt || args.createdAt,
    },
  ]
}

export function buildImageArtifacts(args: {
  taskData: TaskData
  projectId: string
  createdAt: string
}): Artifact[] {
  return (args.taskData.labContext?.images ?? []).map((image) => ({
    id: `artifact:${args.taskData.taskId}:image:${image.id}`,
    projectId: args.projectId,
    taskId: args.taskData.taskId,
    kind: "source-image",
    uri: image.src,
    data: {
      imageId: image.id,
      width: image.width,
      height: image.height,
      show: image.show,
      levelId: args.taskData.labContext?.levelId,
    },
    createdAt: args.createdAt,
  }))
}

export function buildFileArtifactIdsByFileId(artifacts: Artifact[]) {
  const fileArtifactIdsByFileId = new Map<string, string[]>()

  for (const artifact of artifacts) {
    if (artifact.kind !== "code-file" || !artifact.data || typeof artifact.data !== "object") {
      continue
    }

    const fileId = "fileId" in artifact.data ? String(artifact.data.fileId) : null

    if (!fileId) {
      continue
    }

    const currentIds = fileArtifactIdsByFileId.get(fileId) ?? []
    currentIds.push(artifact.id)
    fileArtifactIdsByFileId.set(fileId, currentIds)
  }

  return fileArtifactIdsByFileId
}
