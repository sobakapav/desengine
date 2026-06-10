import "server-only"

import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config"
import {
  createDefaultProject,
  resolveProjectPreviewConfig,
  type Project,
  type ProjectWorkspace,
} from "@/lib/project/runtime"

import type { LevelConfig } from "../level/types"
import type { PromptContext, PromptRenderContext } from "../prompt/types"
import { buildTaskWorkflowArtifactProjection, type TaskProjectionWorkbenchFile } from "./projection"
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
}

type BuildPromptRenderContextInput = BuildTaskPromptContextInput & {
  project: ProjectWorkspace
}

type BuildPromptContextInput = {
  project?: ProjectWorkspace
  task: TaskInstance
  workflowStep: WorkflowStepInstance
  artifacts: Artifact[]
  workbench?: WorkbenchInstance
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
}

function buildPromptRenderContext(input: BuildPromptRenderContextInput): PromptRenderContext {
  const project = input.project
  const previewProject = resolveProjectPreviewConfig(project)
  const selectedUiKit = sandpackUiKitsConfig[project.settings.uiKitId]
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
    project: {
      id: project.id,
      title: project.title,
      uiKitId: project.settings.uiKitId,
      uiKitTitle: selectedUiKit.title,
      uiMode: project.settings.uiMode,
      effectiveUiKitId: effectiveUiKit.id,
      effectiveUiKitTitle: effectiveUiKit.title,
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
    userText: args.userText,
    constraints: args.constraints,
    providerCapabilities: args.providerCapabilities,
    renderContext: args.renderContext,
  })
}

function buildTaskRuntimePromptContext(input: BuildTaskRuntimePromptContextInput): PromptContext {
  const project = input.project ?? createDefaultProject(`task-${input.taskId}`)
  const renderContext = buildPromptRenderContext({ ...input, project })
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

  return buildPromptContextFromProjection({
    projection,
    project,
    renderContext,
    userText: input.userText,
    constraints: input.constraints,
    providerCapabilities: input.providerCapabilities,
  })
}

function buildTaskPromptContext(input: BuildTaskPromptContextInput): PromptRenderContext {
  return buildPromptRenderContext({
    ...input,
    project: input.project ?? createDefaultProject(`task-${input.taskId}`),
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
