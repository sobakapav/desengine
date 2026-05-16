import { AuthState } from "../auth/types"
import { getLlmStatus } from "../llm/server"
import { Instruction, Resource } from "../system/types"

type SystemStatusModel = {
  llmStatus: Awaited<ReturnType<typeof getLlmStatus>>
  items: Resource[]
  instructions: Instruction[]
  allowlistConfigured: boolean
  authState: AuthState
  hasAccess: boolean
  onboardingRepoConfigured: boolean
  onboardingSyncState: string
  readyForProtectedLab: boolean
}


export type {
  SystemStatusModel
}