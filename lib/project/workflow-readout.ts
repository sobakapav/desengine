import "server-only"

import { appConfig } from "@/lib/system/config/server"
import {
  getBaseProjectId,
  getProjectComponentId,
  listStoredTaskProjects,
} from "@/lib/task/project-runtime-scope"
import { buildTaskWorkflowArtifactProjection, resolveWorkflowStepTitle } from "@/lib/task/projection"
import { getTaskCheckResult, getTaskLabContext, getTasks } from "@/lib/task/server"
import type { ArtifactKind, TaskInstanceStatus, WorkflowStepInstanceStatus } from "@/lib/task/model"
import { buildCurrentTaskScreenData } from "@/lib/task/task-screen-data"
import { getWorkbenchDefinition, labWorkbenchRegistry } from "@/lib/workbench"

type ProjectWorkflowArtifactKindSummary = {
  kind: ArtifactKind
  count: number
}

type ProjectWorkflowReadoutEntry = {
  projectId: string
  taskId: string
  taskTitle: string
  componentId: string | null
  runStatus: TaskInstanceStatus
  workflowInstanceId: string
  workflowStepId: string
  workflowStepKind: string
  workflowStepTitle: string
  workflowStepStatus: WorkflowStepInstanceStatus
  lastActivityAt: string | null
  workflowPointCount: number
  completedWorkflowPointCount: number
  activeWorkflowPointTitle: string | null
  totalArtifactCount: number
  inputArtifactCount: number
  outputArtifactCount: number
  artifactKindSummary: ProjectWorkflowArtifactKindSummary[]
  artifactPreview: string[]
  workflowPoints: Array<{
    stepId: string
    kind: string
    title: string
    status: WorkflowStepInstanceStatus
    outputArtifactCount: number
  }>
  workbenchInstanceId: string | null
  workbenchDefinitionId: string | null
  workbenchDefinitionTitle: string | null
  workbenchProfileId: string | null
}

type ProjectWorkflowReadoutSnapshot = {
  projectId: string
  entries: ProjectWorkflowReadoutEntry[]
}

function summarizeArtifactKinds(kinds: ArtifactKind[]): ProjectWorkflowArtifactKindSummary[] {
  const counts = new Map<ArtifactKind, number>()

  for (const kind of kinds) {
    counts.set(kind, (counts.get(kind) ?? 0) + 1)
  }

  return [...counts.entries()]
    .map(([kind, count]) => ({ kind, count }))
    .sort((left, right) => {
      if (right.count !== left.count) {
        return right.count - left.count
      }

      return left.kind.localeCompare(right.kind)
    })
}

function resolveArtifactPreviewLabel(taskId: string, artifact: {
  kind: ArtifactKind
  uri?: string
  data?: unknown
}) {
  if (artifact.kind === "code-file" && artifact.uri?.startsWith(`task-file://${taskId}/`)) {
    return artifact.uri.slice(`task-file://${taskId}/`.length)
  }

  if (artifact.kind === "source-image" && artifact.uri) {
    return artifact.uri
  }

  if (artifact.kind === "prompt-entry") {
    return "Prompt history"
  }

  if (artifact.kind === "check-result") {
    return "Check-result"
  }

  return artifact.kind
}

async function readProjectWorkflowReadout(projectId: string): Promise<ProjectWorkflowReadoutSnapshot> {
  const tasks = await getTasks()

  const entries = await Promise.all(tasks.map(async (taskItem) => {
    const projects = await listStoredTaskProjects(taskItem.id)
    const matchingProjects = projects.filter((project) => getBaseProjectId(project.id) === projectId)

    return Promise.all(matchingProjects.map(async (project) => {
      const [labContext, checkResult] = await Promise.all([
        getTaskLabContext(taskItem),
        getTaskCheckResult(taskItem.id),
      ])
      const { taskData } = await buildCurrentTaskScreenData({
        taskId: taskItem.id,
        taskItem,
        labContext,
        project,
      })

      const projection = buildTaskWorkflowArtifactProjection({
        taskData,
        taskItem,
        projectId,
        title: taskItem.id,
        checkResult,
        workbenchFiles: appConfig.taskWorkbenchFiles,
      })
      const workflowStep = projection.workflow.stepInstances.find(
        (step) => step.id === projection.workflow.currentStepId,
      ) ?? projection.workflow.stepInstances[0]

      if (!workflowStep) {
        return null
      }

      const workflowPoints = projection.workflow.stepInstances
        .filter((step) => step.id !== projection.workflow.currentStepId)
        .map((step) => ({
          stepId: step.id,
          kind: step.kind,
          title: resolveWorkflowStepTitle({
            taskId: projection.task.id,
            stepId: step.id,
            stepKind: step.kind,
            taskData,
            taskItem,
          }),
          status: step.status,
          outputArtifactCount: step.outputArtifactIds.length,
        }))
      const lastActivityCandidates = [
        ...taskData.promptHistory.map((entry) => entry.createdAt).filter(Boolean),
        checkResult?.createdAt ?? null,
      ].filter((value): value is string => Boolean(value))
      const lastActivityAt = lastActivityCandidates.sort().at(-1) ?? null

      const workbenchInstanceId = workflowStep.runtimeBindings?.primaryWorkbenchInstanceId
        ?? workflowStep.runtimeBindings?.workbenchInstanceIds[0]
        ?? projection.workbenchInstances[0]?.id
        ?? null
      const workbenchInstance = workbenchInstanceId
        ? projection.workbenchInstances.find((instance) => instance.id === workbenchInstanceId) ?? null
        : null
      const workbenchDefinition = workbenchInstance
        ? getWorkbenchDefinition(labWorkbenchRegistry, workbenchInstance.definitionId)
        : null

      const artifactById = new Map(projection.artifacts.map((artifact) => [artifact.id, artifact] as const))
      const inputArtifacts = workflowStep.inputArtifactIds
        .map((artifactId) => artifactById.get(artifactId))
        .filter((artifact): artifact is NonNullable<typeof artifact> => artifact !== undefined)
      const outputArtifacts = workflowStep.outputArtifactIds
        .map((artifactId) => artifactById.get(artifactId))
        .filter((artifact): artifact is NonNullable<typeof artifact> => artifact !== undefined)

      return {
        projectId,
        taskId: projection.task.id,
        taskTitle: projection.task.title,
        componentId: getProjectComponentId(project.id),
        runStatus: projection.task.status,
        workflowInstanceId: projection.workflow.id,
        workflowStepId: workflowStep.id,
        workflowStepKind: workflowStep.kind,
        workflowStepTitle: resolveWorkflowStepTitle({
          taskId: projection.task.id,
          stepId: workflowStep.id,
          stepKind: workflowStep.kind,
          taskData,
          taskItem,
        }),
        workflowStepStatus: workflowStep.status,
        lastActivityAt,
        workflowPointCount: workflowPoints.length,
        completedWorkflowPointCount: workflowPoints.filter((point) => point.status === "completed").length,
        activeWorkflowPointTitle: workflowPoints.find((point) => point.status === "in_progress")?.title ?? null,
        totalArtifactCount: projection.artifacts.length,
        inputArtifactCount: inputArtifacts.length,
        outputArtifactCount: outputArtifacts.length,
        artifactKindSummary: summarizeArtifactKinds(projection.artifacts.map((artifact) => artifact.kind)),
        artifactPreview: projection.artifacts.slice(0, 4).map((artifact) => resolveArtifactPreviewLabel(projection.task.id, artifact)),
        workflowPoints,
        workbenchInstanceId,
        workbenchDefinitionId: workbenchDefinition?.id ?? workbenchInstance?.definitionId ?? null,
        workbenchDefinitionTitle: workbenchDefinition?.title ?? null,
        workbenchProfileId: workbenchDefinition?.profileId ?? null,
      } satisfies ProjectWorkflowReadoutEntry
    }))
  }))

  const resolvedEntries: ProjectWorkflowReadoutEntry[] = []

  for (const group of entries) {
    for (const entry of group) {
      if (entry) {
        resolvedEntries.push(entry)
      }
    }
  }

  resolvedEntries.sort((left, right) => {
    const componentCompare = (left.componentId ?? "").localeCompare(right.componentId ?? "")
    if (componentCompare !== 0) {
      return componentCompare
    }

    return left.taskId.localeCompare(right.taskId)
  })

  return {
    projectId,
    entries: resolvedEntries,
  }
}

export { readProjectWorkflowReadout }

export type {
  ProjectWorkflowArtifactKindSummary,
  ProjectWorkflowReadoutEntry,
  ProjectWorkflowReadoutSnapshot,
}
