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
  project?: Record<string, unknown>
}

type PromptContext = {
  project: ProjectWorkspace
  task: TaskInstance
  workflowStep: WorkflowStepInstance
  artifacts: Artifact[]
  workbench?: WorkbenchInstance
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
