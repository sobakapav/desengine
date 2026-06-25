import "server-only"

import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config"
import {
  createDefaultProject,
  type Project,
  type ProjectWorkspace,
} from "@/lib/project/runtime"

import type { LevelConfig } from "../level/types"
import type { PromptContext, PromptRenderContext } from "../prompt/types"
import {
  buildTaskWorkflowArtifactProjection,
  resolveImageComponentWorkflowPointByFileId,
  resolveImageComponentWorkflowPointByLevel,
  resolveTaskWorkflowPointFocus,
  type TaskProjectionWorkbenchFile,
  type TaskWorkflowPointFocus,
} from "./projection"
import type {
  Artifact,
  TaskInstance,
  TaskWorkflowArtifactProjection,
  WorkflowStepInstance,
} from "./model"
import type { TaskCheckResult, TaskData, TaskListItem } from "./types"
import type { WorkbenchInstance } from "../workbench/model"

type BuildTaskPromptContextInput = {
  taskId: string
  taskMaxLevel: number
  taskImages: unknown
  levelTaskTip?: string
  levelTaskCheckContract?: string
  level: Pick<LevelConfig, "id" | "number" | "title" | "labId" | "editableFileIds">
  project?: Project
  activeFileId?: string | null
}

type BuildPromptRenderContextInput = BuildTaskPromptContextInput & {
  project: ProjectWorkspace
  workflowPoint?: TaskWorkflowPointFocus | null
}

type BuildPromptContextInput = {
  project?: ProjectWorkspace
  task: TaskInstance
  workflowStep: WorkflowStepInstance
  artifacts: Artifact[]
  workbench?: WorkbenchInstance
  workflowPoint?: TaskWorkflowPointFocus | null
  userText?: string
  constraints?: string[]
  providerCapabilities?: string[]
  renderContext: PromptRenderContext
}

type BuildTaskRuntimePromptContextInput = BuildTaskPromptContextInput & {
  taskData: TaskData
  taskItem?: TaskListItem
  workbenchFiles?: TaskProjectionWorkbenchFile[]
  userText?: string
  constraints?: string[]
  providerCapabilities?: string[]
  checkResult?: TaskCheckResult | null
  createdAt?: string
  activeFileId?: string | null
}

function buildPromptRenderContext(input: BuildPromptRenderContextInput): PromptRenderContext {
  const project = input.project
  const selectedUiKit = sandpackUiKitsConfig[project.settings.uiKitId]

  return {
    user: {
      designSystemId: selectedUiKit.id,
      designSystemName: selectedUiKit.title,
    },
    task: {
      id: input.taskId,
      maxLevel: input.taskMaxLevel,
      images: input.taskImages,
      tip: input.levelTaskTip,
      checkContract: input.levelTaskCheckContract,
    },
    level: {
      id: input.level.id,
      number: input.level.number,
      title: input.level.title,
      labId: input.level.labId,
      editableFileIds: input.level.editableFileIds,
    },
    workflow: input.workflowPoint
      ? {
        focusPointId: input.workflowPoint.id,
        focusPointKind: input.workflowPoint.kind,
        focusPointTitle: input.workflowPoint.title,
        focusFileIds: input.workflowPoint.fileIds,
        primaryFileId: input.workflowPoint.primaryFileId,
      }
      : undefined,
    project: {
      id: project.id,
      title: project.title,
      uiKitId: project.settings.uiKitId,
      uiKitTitle: selectedUiKit.title,
    },
  }
}

function buildPromptContext(input: BuildPromptContextInput): PromptContext {
  return {
    project: input.project ?? createDefaultProject(input.task.projectId),
    task: input.task,
    workflowStep: input.workflowStep,
    artifacts: input.artifacts,
    workbench: input.workbench,
    workflowPoint: input.workflowPoint ?? undefined,
    userText: input.userText,
    constraints: input.constraints ?? [],
    providerCapabilities: input.providerCapabilities ?? [],
    renderContext: input.renderContext,
  }
}

function buildPromptContextFromProjection(args: {
  projection: TaskWorkflowArtifactProjection
  project?: ProjectWorkspace
  renderContext: PromptRenderContext
  workflowPoint?: TaskWorkflowPointFocus | null
  userText?: string
  constraints?: string[]
  providerCapabilities?: string[]
}): PromptContext {
  const workflowStep = args.projection.workflow.stepInstances.find(
    (step) => step.id === args.projection.workflow.currentStepId,
  ) ?? args.projection.workflow.stepInstances[0]

  if (!workflowStep) {
    throw new Error("PromptContext требует workflow step")
  }

  if (workflowStep.projectId !== args.projection.workflow.projectId) {
    throw new Error("PromptContext требует project-aware workflow step")
  }

  const workbenchInstanceId = workflowStep.runtimeBindings?.primaryWorkbenchInstanceId
    ?? workflowStep.runtimeBindings?.workbenchInstanceIds[0]

  return buildPromptContext({
    project: args.project,
    task: args.projection.task,
    workflowStep,
    artifacts: args.projection.artifacts,
    workbench: args.projection.workbenchInstances.find(
      (workbench) => workbench.id === workbenchInstanceId,
    ),
    workflowPoint: args.workflowPoint,
    userText: args.userText,
    constraints: args.constraints,
    providerCapabilities: args.providerCapabilities,
    renderContext: args.renderContext,
  })
}

function buildTaskRuntimePromptContext(input: BuildTaskRuntimePromptContextInput): PromptContext {
  const project = input.project ?? createDefaultProject(`task-${input.taskId}`)
  const projection = buildTaskWorkflowArtifactProjection({
    taskData: input.taskData,
    project,
    taskItem: input.taskItem,
    title: input.level.title,
    checkResult: input.checkResult,
    workbenchFiles: input.workbenchFiles,
    createdAt: input.createdAt,
    allowLegacyProjectIdFallback: true,
  })
  const workflowPoint = resolveTaskWorkflowPointFocus({
    projection,
    activeFileId: input.activeFileId ?? null,
  })
  const renderContext = buildPromptRenderContext({
    ...input,
    project,
    workflowPoint,
  })

  return buildPromptContextFromProjection({
    projection,
    project,
    renderContext,
    workflowPoint,
    userText: input.userText,
    constraints: input.constraints,
    providerCapabilities: input.providerCapabilities,
  })
}

function buildTaskPromptContext(input: BuildTaskPromptContextInput): PromptRenderContext {
  const resolvedWorkflowPoint = resolveImageComponentWorkflowPointByFileId(input.activeFileId)
    ?? resolveImageComponentWorkflowPointByLevel(input.level.number)
  const workflowPoint = resolvedWorkflowPoint
    ? {
      id: resolvedWorkflowPoint.id,
      stepId: `workflow-step:${input.taskId}:image-to-component:${resolvedWorkflowPoint.id}`,
      kind: resolvedWorkflowPoint.kind,
      title: resolvedWorkflowPoint.title,
      fileIds: resolvedWorkflowPoint.fileIds,
      primaryFileId: input.activeFileId && resolvedWorkflowPoint.fileIds.includes(input.activeFileId)
        ? input.activeFileId
        : resolvedWorkflowPoint.fileIds[0] ?? null,
      status: "not_started" as const,
    }
    : null

  return buildPromptRenderContext({
    ...input,
    project: input.project ?? createDefaultProject(`task-${input.taskId}`),
    workflowPoint,
  })
}

function getPromptContextArtifactsByKind<TKind extends Artifact["kind"]>(
  context: PromptContext,
  kind: TKind,
) {
  return context.artifacts.filter((artifact): artifact is Artifact & { kind: TKind } => artifact.kind === kind)
}

export {
  buildPromptContext,
  buildPromptContextFromProjection,
  buildPromptRenderContext,
  buildTaskRuntimePromptContext,
  buildTaskPromptContext,
  getPromptContextArtifactsByKind,
  type BuildPromptContextInput,
  type BuildTaskRuntimePromptContextInput,
  type BuildTaskPromptContextInput,
}
