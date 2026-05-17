/** Система и её ресурсы */

import {
  RESOURCE_STATES,
  RESOURCE_IDS,
  USER_ROLES,
  LLM_PROVIDER_IDS,
} from "./const"
import type { OnboardingSyncState } from "@/lib/onboarding/status"

/** Cтатус системного ресурса */
type ResourceState =
  (typeof RESOURCE_STATES)[number]

/** ID системного ресурса */
type ResourceId =
  (typeof RESOURCE_IDS)[number]

/** Контрол исправления статуса, который можно показать прямо в карточке ресурса */
type ResourceRemediationControl =
  | {
      kind: "auth-form"
    }
  | {
      kind: "onboarding-update"
      canUpdate: boolean
      detail: string
      syncState: OnboardingSyncState
    }
  | {
      kind: "system-update"
      canUpdate: boolean
      currentVersion: string | null
      detail: string
      latestVersion: string | null
    }

/** Системный ресурс */
type Resource = {
  id: ResourceId
  label: string
  state: ResourceState
  summary: string
  detail: string
  remediationControl?: ResourceRemediationControl
}

/** Роль пользователя в системе */
type UserRole = 
  (typeof USER_ROLES)[number]

/** Инструкция */
// ? Может, в help?
type Instruction = {
  id: ResourceId
  actor: UserRole
  text: string
}

/** ID LLM-провайдера */
type LlmProviderId = 
  (typeof LLM_PROVIDER_IDS)[number]


export type {
  ResourceState,
  ResourceId,
  ResourceRemediationControl,
  Resource,
  UserRole,
  Instruction,
  LlmProviderId,
}
