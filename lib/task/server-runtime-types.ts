import type { TaskConfig } from "./types"
import type {
  TaskProgressSummary,
  TaskTransition,
} from "./types"

export type TaskCatalogItem = {
  id: string
  config: TaskConfig
}

export type TaskProgressMutationResult = {
  summary: TaskProgressSummary
  transition: TaskTransition | null
}

export type TaskCheckMutationResult = {
  summary: TaskProgressSummary
  transition: TaskTransition | null
  attemptNumber: number
  maxCheckAttempts: number
}

export type FailedTaskCheckMutationResult = {
  summary: TaskProgressSummary | null
  attemptNumber: number
  maxCheckAttempts: number
  reset: boolean
}
