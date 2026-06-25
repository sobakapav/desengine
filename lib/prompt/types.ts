import type { LlmCallRecord } from "../llm/types"
import type { ProjectWorkspace } from "../project/runtime"
import type {
  Artifact,
  TaskInstance,
  WorkflowStepInstance,
} from "../task/model"
import type { WorkbenchInstance } from "../workbench/model"

type PromptName = "default" | "iterate-component" | "start-component"
type PromptKind = "production" | "didactic"

type PromptRenderContext = {
  user?: {
    designSystemId?: string
    designSystemName?: string
  }
  task?: Record<string, unknown>
  level?: {
    id: string
    number: number
    title?: string
    labId?: string
    editableFileIds?: string[]
  }
  workflow?: {
    focusPointId?: string
    focusPointKind?: string
    focusPointTitle?: string
    focusFileIds?: string[]
    primaryFileId?: string | null
  }
  project?: Record<string, unknown>
}

type PromptContext = {
  project: ProjectWorkspace
  task: TaskInstance
  workflowStep: WorkflowStepInstance
  artifacts: Artifact[]
  workbench?: WorkbenchInstance
  workflowPoint?: {
    id: string
    stepId: string
    kind: string
    title: string
    fileIds: string[]
    primaryFileId: string | null
    status: WorkflowStepInstance["status"]
  }
  userText?: string
  constraints: string[]
  providerCapabilities: string[]
  renderContext: PromptRenderContext
}

type PromptContextDownstreamConsumer = "task-hints-templating" | "prompt-builder" | "llm-flow"

type PromptContextDownstreamContract = {
  consumer: PromptContextDownstreamConsumer
  input: PromptContext
}

type PromptHistoryEntry = {
  text: string
  createdAt: string
  displayCreatedAt?: string
  iterationNumber?: number
  levelNumber?: number
  selectedFileNames?: string[]
  changedFileIds?: string[]
  changedFileNames?: string[]
  teachingCostCents?: number
  llmCall?: LlmCallRecord
}

export type {
  PromptName,
  PromptKind,
  PromptContext,
  PromptContextDownstreamConsumer,
  PromptContextDownstreamContract,
  PromptRenderContext,
  PromptHistoryEntry,
}
