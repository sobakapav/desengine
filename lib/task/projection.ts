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

export type TaskProjectionWorkbenchFile = {
  id: string
  fileName: string
  title: string
  edit: boolean
}

export type ImageComponentWorkflowPointDefinition = {
  id: string
  kind: string
  title: string
  legacyLevelHint: number
  fileIds: string[]
}

export type TaskWorkflowPointFocus = {
  id: string
  stepId: string
  kind: string
  title: string
  fileIds: string[]
  primaryFileId: string | null
  status: WorkflowStepInstanceStatus
}

const IMAGE_COMPONENT_WORKFLOW_TASK_TYPE = "image-to-component-workflow"
const IMAGE_COMPONENT_WORKFLOW_DEFINITION_ID = "workflow-definition:image-to-component"
const IMAGE_COMPONENT_WORKFLOW_COORDINATOR_KIND = "image-to-component-workflow"
const IMAGE_COMPONENT_WORKFLOW_COORDINATOR_TITLE = "Работаем над workflow"

const imageComponentWorkflowPoints: ImageComponentWorkflowPointDefinition[] = [
  {
    id: "ui-kit-component",
    kind: "ui-kit-component",
    title: "Базовый компонент из UI kit",
    legacyLevelHint: 1,
    fileIds: ["markup", "component"],
  },
  {
    id: "styles",
    kind: "styles",
    title: "Стилизация компонента",
    legacyLevelHint: 2,
    fileIds: ["styles"],
  },
  {
    id: "mock-data",
    kind: "mock-data",
    title: "Примеры доменных данных",
    legacyLevelHint: 3,
    fileIds: ["mock"],
  },
  {
    id: "props-contract",
    kind: "props-contract",
    title: "Props-контракт компонента",
    legacyLevelHint: 3,
    fileIds: ["props"],
  },
  {
    id: "storybook",
    kind: "storybook",
    title: "Storybook-сценарии",
    legacyLevelHint: 1,
    fileIds: ["stories"],
  },
]

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

function buildCoordinatorStepId(taskId: string) {
  return `workflow-step:${taskId}:image-to-component:run`
}

function buildWorkflowPointStepId(taskId: string, pointId: string) {
  return `workflow-step:${taskId}:image-to-component:${pointId}`
}

function resolveCurrentLevel(taskData: TaskData, taskItem?: TaskListItem) {
  return taskItem?.progress.currentLevel ?? taskData.labContext?.levelNumber ?? 1
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

function buildFileArtifactIdsByFileId(artifacts: Artifact[]) {
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

function buildWorkflowStepTitleMap(taskId: string) {
  const titles = new Map<string, string>([
    [buildCoordinatorStepId(taskId), IMAGE_COMPONENT_WORKFLOW_COORDINATOR_TITLE],
  ])

  for (const point of imageComponentWorkflowPoints) {
    titles.set(buildWorkflowPointStepId(taskId, point.id), point.title)
  }

  return titles
}

export function resolveImageComponentWorkflowPointByKind(kind: string) {
  return imageComponentWorkflowPoints.find((point) => point.kind === kind) ?? null
}

export function resolveImageComponentWorkflowPointByFileId(fileId?: string | null) {
  if (!fileId) {
    return null
  }

  return imageComponentWorkflowPoints.find((point) => point.fileIds.includes(fileId)) ?? null
}

export function resolveImageComponentWorkflowPointByLevel(levelNumber: number) {
  return imageComponentWorkflowPoints.find((point) => point.legacyLevelHint === levelNumber)
    ?? imageComponentWorkflowPoints[0]
    ?? null
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

  const workflowPoints = imageComponentWorkflowPoints.map((point) => {
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
 * const title = resolveWorkflowStepTitle({
 *   taskId: "intro-card",
 *   stepId: "workflow-step:intro-card:image-to-component:storybook",
 *   stepKind: "storybook",
 * })
 * ```
 */
export function resolveWorkflowStepTitle(args: {
  taskId: string
  stepId: string
  stepKind: string
  taskData?: TaskData
  taskItem?: TaskListItem
}) {
  const titleMap = buildWorkflowStepTitleMap(args.taskId)
  const explicitTitle = titleMap.get(args.stepId)

  if (explicitTitle) {
    return explicitTitle
  }

  if (args.stepKind === "level-lab") {
    const levelNumber = args.taskItem?.progress.currentLevel ?? args.taskData?.labContext?.levelNumber

    if (levelNumber) {
      return `Шаг workflow: уровень ${levelNumber}`
    }
  }

  return `Шаг workflow: ${args.stepKind}`
}

export function listImageComponentWorkflowPoints() {
  return imageComponentWorkflowPoints
}

export function resolveTaskWorkflowPointFocus(args: {
  projection: TaskWorkflowArtifactProjection
  activeFileId?: string | null
}): TaskWorkflowPointFocus | null {
  const activePoint = resolveImageComponentWorkflowPointByFileId(args.activeFileId)
  const workflowPointSteps = args.projection.workflow.stepInstances.filter(
    (step) => step.id !== args.projection.workflow.currentStepId,
  )

  const focusedStep = activePoint
    ? workflowPointSteps.find((step) => step.kind === activePoint.kind)
    : workflowPointSteps.find((step) => step.status === "in_progress")
      ?? workflowPointSteps[0]

  if (!focusedStep) {
    return null
  }

  const point = resolveImageComponentWorkflowPointByKind(focusedStep.kind)

  if (!point) {
    return null
  }

  return {
    id: point.id,
    stepId: focusedStep.id,
    kind: point.kind,
    title: point.title,
    fileIds: [...point.fileIds],
    primaryFileId: args.activeFileId && point.fileIds.includes(args.activeFileId)
      ? args.activeFileId
      : point.fileIds[0] ?? null,
    status: focusedStep.status,
  }
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
