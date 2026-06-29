import type {
  TaskWorkflowArtifactProjection,
  WorkflowStepInstanceStatus,
} from "./model"

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

export const IMAGE_COMPONENT_WORKFLOW_COORDINATOR_KIND = "image-to-component-workflow"
export const IMAGE_COMPONENT_WORKFLOW_COORDINATOR_TITLE = "Работаем над workflow"

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

export function buildCoordinatorStepId(taskId: string) {
  return `workflow-step:${taskId}:image-to-component:run`
}

export function buildWorkflowPointStepId(taskId: string, pointId: string) {
  return `workflow-step:${taskId}:image-to-component:${pointId}`
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
  taskData?: { labContext?: { levelNumber?: number | null } | null }
  taskItem?: { progress: { currentLevel: number } }
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

/**
 * @example
 * ```ts
 * const points = listImageComponentWorkflowPoints()
 * ```
 */
export function listImageComponentWorkflowPoints() {
  return imageComponentWorkflowPoints
}

/**
 * @example
 * ```ts
 * const focus = resolveTaskWorkflowPointFocus({
 *   projection,
 *   activeFileId: "styles",
 * })
 * ```
 */
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
