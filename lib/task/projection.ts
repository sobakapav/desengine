import type { ProjectWorkspace } from "@/lib/project/runtime"
import { createLabWorkbenchInstance } from "@/lib/workbench/lab-profile"

import type {
  Artifact,
  TaskInstanceStatus,
  TaskProjectionProjectScope,
  TaskWorkflowArtifactProjection,
  WorkflowStepInstance,
  WorkflowStepInstanceStatus,
} from "./model"
import type { TaskCheckResult, TaskData, TaskListItem } from "./types"
import {
  buildCheckResultArtifact,
  buildFileArtifactIdsByFileId,
  buildFileArtifacts,
  buildImageArtifacts,
  buildPromptArtifacts,
} from "./projection-artifacts"
import {
  buildCoordinatorStepId,
  buildWorkflowPointStepId,
  IMAGE_COMPONENT_WORKFLOW_COORDINATOR_KIND,
  listImageComponentWorkflowPoints,
  type ImageComponentWorkflowPointDefinition,
  type TaskProjectionWorkbenchFile,
} from "./workflow-points"

export {
  listImageComponentWorkflowPoints,
  resolveImageComponentWorkflowPointByFileId,
  resolveImageComponentWorkflowPointByKind,
  resolveImageComponentWorkflowPointByLevel,
  resolveTaskWorkflowPointFocus,
  resolveWorkflowStepTitle,
  type ImageComponentWorkflowPointDefinition,
  type TaskProjectionWorkbenchFile,
  type TaskWorkflowPointFocus,
} from "./workflow-points"

const IMAGE_COMPONENT_WORKFLOW_TASK_TYPE = "image-to-component-workflow"
const IMAGE_COMPONENT_WORKFLOW_DEFINITION_ID = "workflow-definition:image-to-component"

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
  if (taskItem.progress.checkAttemptsUsed >= taskItem.progress.checkAttemptsLimit) return "blocked"
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

function resolveCurrentLevel(taskData: TaskData, taskItem?: TaskListItem) {
  return taskItem?.progress.currentLevel ?? taskData.labContext?.levelNumber ?? 1
}

function resolveWorkflowPointStatus(args: {
  point: ImageComponentWorkflowPointDefinition
  currentLevel: number
  taskItem?: TaskListItem
  relatedArtifactIds: string[]
}): WorkflowStepInstanceStatus {
  if (args.taskItem?.progress.isCompleted) {
    return "completed"
  }

  const levelDelta = args.currentLevel - args.point.legacyLevelHint
  const hasArtifacts = args.relatedArtifactIds.length > 0
  const taskStarted = Boolean(args.taskItem?.progress.currentLevelStarted || args.taskItem?.started)

  if (levelDelta > 0) {
    return "completed"
  }

  if (levelDelta === 0) {
    if (hasArtifacts || taskStarted) {
      return "in_progress"
    }

    return "not_started"
  }

  if (hasArtifacts) {
    return "in_progress"
  }

  return "not_started"
}

function buildWorkflowSteps(args: {
  taskData: TaskData
  taskItem?: TaskListItem
  checkResult?: TaskCheckResult | null
  artifacts: Artifact[]
  projectId: string
  workbenchInstanceId: string
}): WorkflowStepInstance[] {
  const currentLevel = resolveCurrentLevel(args.taskData, args.taskItem)
  const inputArtifactIds = args.artifacts
    .filter((artifact) => artifact.kind === "source-image")
    .map((artifact) => artifact.id)
  const outputArtifactIds = args.artifacts
    .filter((artifact) => artifact.kind !== "source-image")
    .map((artifact) => artifact.id)
  const fileArtifactIdsByFileId = buildFileArtifactIdsByFileId(args.artifacts)
  const coordinatorStepId = buildCoordinatorStepId(args.taskData.taskId)
  const workflowPointDefinitions = listImageComponentWorkflowPoints()

  const workflowPoints = workflowPointDefinitions.map((point) => {
    const relatedArtifactIds = point.fileIds.flatMap((fileId) => fileArtifactIdsByFileId.get(fileId) ?? [])

    return {
      id: buildWorkflowPointStepId(args.taskData.taskId, point.id),
      projectId: args.projectId,
      kind: point.kind,
      status: resolveWorkflowPointStatus({
        point,
        currentLevel,
        taskItem: args.taskItem,
        relatedArtifactIds,
      }),
      inputArtifactIds,
      outputArtifactIds: relatedArtifactIds,
    } satisfies WorkflowStepInstance
  })

  return [
    {
      id: coordinatorStepId,
      projectId: args.projectId,
      kind: IMAGE_COMPONENT_WORKFLOW_COORDINATOR_KIND,
      status: normalizeStepStatus(args.taskItem, args.checkResult),
      inputArtifactIds,
      outputArtifactIds,
      runtimeBindings: {
        workbenchInstanceIds: [args.workbenchInstanceId],
        primaryWorkbenchInstanceId: args.workbenchInstanceId,
      },
    },
    ...workflowPoints,
  ]
}

/**
 * @example
 * ```ts
 * const projection = buildTaskWorkflowArtifactProjection({
 *   taskData,
 *   projectId: "project-1",
 *   taskItem,
 * })
 * ```
 */
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
  const currentStepId = buildCoordinatorStepId(args.taskData.taskId)
  const workflowInstanceId = `workflow:${args.taskData.taskId}:image-to-component`
  const workbenchInstanceId = `workbench:${args.taskData.taskId}`
  const workbenchInstance = createLabWorkbenchInstance({
    projectId: scope.projectId,
    taskId: args.taskData.taskId,
    workflowStepId: currentStepId,
    artifacts,
  })
  const stepInstances = buildWorkflowSteps({
    taskData: args.taskData,
    taskItem: args.taskItem,
    checkResult: args.checkResult,
    artifacts,
    projectId: scope.projectId,
    workbenchInstanceId,
  })

  return {
    task: {
      id: args.taskData.taskId,
      projectId: scope.projectId,
      taskType: args.taskType ?? IMAGE_COMPONENT_WORKFLOW_TASK_TYPE,
      title: args.title ?? args.taskItem?.id ?? args.taskData.taskId,
      workflowInstanceId,
      artifactIds: artifacts.map((artifact) => artifact.id),
      status: normalizeTaskStatus(args.taskItem),
    },
    workflow: {
      id: workflowInstanceId,
      projectId: scope.projectId,
      taskId: args.taskData.taskId,
      definitionId: IMAGE_COMPONENT_WORKFLOW_DEFINITION_ID,
      currentStepId,
      stepInstances,
    },
    artifacts,
    workbenchInstances: [workbenchInstance],
    compatibility: {
      legacyProjectIdFallback: scope.legacyProjectIdFallback,
    },
  }
}
