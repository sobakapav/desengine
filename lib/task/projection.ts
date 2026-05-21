import type { ProjectWorkspace } from "@/lib/project/runtime"
import { createLabWorkbenchInstance } from "@/lib/workbench/lab-profile"

import type {
  Artifact,
  TaskInstanceStatus,
  TaskProjectionProjectScope,
  TaskWorkflowArtifactProjection,
  WorkflowStepInstanceStatus,
} from "./model"
import type { TaskCheckResult, TaskData, TaskListItem } from "./types"

export type TaskProjectionWorkbenchFile = {
  id: string
  fileName: string
  title: string
  edit: boolean
}

type TaskProjectionArgs = {
  taskData: TaskData
  projectId?: string
  project?: ProjectWorkspace
  taskItem?: TaskListItem
  title?: string
  taskType?: string
  checkResult?: TaskCheckResult | null
  workbenchFiles?: TaskProjectionWorkbenchFile[]
  createdAt?: string
  allowLegacyProjectIdFallback?: boolean
}

function requireProjectScope(args: {
  projectId?: string
  project?: ProjectWorkspace
  taskId: string
  allowLegacyProjectIdFallback?: boolean
}): TaskProjectionProjectScope {
  const projectId = args.project?.id ?? args.projectId

  if (projectId) {
    return {
      projectId,
      project: args.project,
      legacyProjectIdFallback: false,
    }
  }

  if (args.allowLegacyProjectIdFallback) {
    return {
      projectId: `task-${args.taskId}`,
      legacyProjectIdFallback: true,
    }
  }

  throw new Error("Task projection требует projectId или ProjectWorkspace")
}

function normalizeTaskStatus(taskItem?: TaskListItem): TaskInstanceStatus {
  if (!taskItem) return "new"
  if (taskItem.progress.isCompleted) return "completed"
  if (taskItem.progress.currentLevelDisplayStatus === "awaiting_check_retry") return "blocked"
  if (taskItem.progress.currentLevelStarted || taskItem.started) return "in_progress"
  return "new"
}

function normalizeStepStatus(taskItem?: TaskListItem, checkResult?: TaskCheckResult | null): WorkflowStepInstanceStatus {
  if (taskItem?.progress.currentLevelStatus === "completed" || taskItem?.progress.isCompleted) {
    return "completed"
  }

  if (checkResult && checkResult.kind !== "passed") {
    return "failed"
  }

  if (taskItem?.progress.currentLevelStarted || taskItem?.started) {
    return "in_progress"
  }

  return "not_started"
}

function createdAtOrFallback(value?: string) {
  return value ?? "1970-01-01T00:00:00.000Z"
}

function buildFileArtifacts(args: {
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

function buildPromptArtifacts(args: {
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

function buildCheckResultArtifact(args: {
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

function buildImageArtifacts(args: {
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

export function buildTaskWorkflowArtifactProjection(args: TaskProjectionArgs): TaskWorkflowArtifactProjection {
  const scope = requireProjectScope({
    projectId: args.projectId,
    project: args.project,
    taskId: args.taskData.taskId,
    allowLegacyProjectIdFallback: args.allowLegacyProjectIdFallback,
  })
  const createdAt = createdAtOrFallback(args.createdAt)
  const workbenchFiles = args.workbenchFiles ?? []
  const artifacts = [
    ...buildFileArtifacts({
      contentByFileId: args.taskData.contentByFileId,
      workbenchFiles,
      projectId: scope.projectId,
      taskId: args.taskData.taskId,
      createdAt,
    }),
    ...buildPromptArtifacts({
      taskData: args.taskData,
      projectId: scope.projectId,
      createdAt,
    }),
    ...buildCheckResultArtifact({
      checkResult: args.checkResult,
      projectId: scope.projectId,
      taskId: args.taskData.taskId,
      createdAt,
    }),
    ...buildImageArtifacts({
      taskData: args.taskData,
      projectId: scope.projectId,
      createdAt,
    }),
  ]
  const currentLevel = args.taskItem?.progress.currentLevel ?? args.taskData.labContext?.levelNumber ?? 1
  const currentStepId = `workflow-step:${args.taskData.taskId}:level-lab:${currentLevel}`
  const inputArtifactIds = artifacts
    .filter((artifact) => artifact.kind === "source-image")
    .map((artifact) => artifact.id)
  const outputArtifactIds = artifacts
    .filter((artifact) => artifact.kind !== "source-image")
    .map((artifact) => artifact.id)
  const workflowInstanceId = `workflow:${args.taskData.taskId}:lab`
  const workbenchInstanceId = `workbench:${args.taskData.taskId}`
  const workbenchInstance = createLabWorkbenchInstance({
    projectId: scope.projectId,
    taskId: args.taskData.taskId,
    workflowStepId: currentStepId,
    artifacts,
  })

  return {
    task: {
      id: args.taskData.taskId,
      projectId: scope.projectId,
      taskType: args.taskType ?? "level-lab",
      title: args.title ?? args.taskItem?.id ?? args.taskData.taskId,
      workflowInstanceId,
      artifactIds: artifacts.map((artifact) => artifact.id),
      status: normalizeTaskStatus(args.taskItem),
    },
    workflow: {
      id: workflowInstanceId,
      projectId: scope.projectId,
      taskId: args.taskData.taskId,
      definitionId: "workflow-definition:level-lab",
      currentStepId,
      stepInstances: [
        {
          id: currentStepId,
          kind: "level-lab",
          status: normalizeStepStatus(args.taskItem, args.checkResult),
          inputArtifactIds,
          outputArtifactIds,
          workbenchInstanceId,
        },
      ],
    },
    artifacts,
    workbenchInstances: [workbenchInstance],
    compatibility: {
      legacyProjectIdFallback: scope.legacyProjectIdFallback,
    },
  }
}
