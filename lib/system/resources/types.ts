import type { AuthState } from "@/lib/auth/types"
import type { LlmStatus } from "@/lib/llm/types"
import type { Instruction, Resource } from "@/lib/system/types"

type ResourceStatesModel = {
  llmStatus: LlmStatus
  items: Resource[]
  instructions: Instruction[]
  allowlistConfigured: boolean
  authState: AuthState
  hasAccess: boolean
  readyForProtectedLab: boolean
}

export type {
  ResourceStatesModel,
}
