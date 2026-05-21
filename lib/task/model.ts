import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { WorkbenchInstance } from "@/lib/workbench/model"

export type TaskInstanceStatus = "new" | "in_progress" | "completed" | "blocked"

export type WorkflowStepInstanceStatus = "not_started" | "in_progress" | "completed" | "failed"

export type ArtifactKind =
  | "code-file"
  | "prompt-entry"
  | "check-result"
  | "source-image"
  | "imported-design-asset"

export type TaskInstance = {
  id: string
  projectId: string
  taskType: string
  title: string
  workflowInstanceId: string
  artifactIds: string[]
  status: TaskInstanceStatus
}

export type WorkflowDefinition = {
  id: string
  taskType: string
  stepKinds: string[]
}

export type WorkflowInstance = {
  id: string
  projectId: string
  taskId: string
  definitionId: string
  currentStepId: string
  stepInstances: WorkflowStepInstance[]
}

export type WorkflowStepInstance = {
  id: string
  kind: string
  status: WorkflowStepInstanceStatus
  inputArtifactIds: string[]
  outputArtifactIds: string[]
  workbenchInstanceId?: string
}

export type Artifact = {
  id: string
  projectId: string
  taskId?: string
  kind: ArtifactKind
  uri?: string
  data?: unknown
  createdAt: string
}

export type TaskWorkflowArtifactProjection = {
  task: TaskInstance
  workflow: WorkflowInstance
  artifacts: Artifact[]
  workbenchInstances: WorkbenchInstance[]
  compatibility: {
    legacyProjectIdFallback: boolean
  }
}

export type TaskProjectionProjectScope = {
  projectId: string
  project?: ProjectWorkspace
  legacyProjectIdFallback: boolean
}
