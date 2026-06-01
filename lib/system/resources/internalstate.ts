import "server-only"

import {
  getAccessControlConfig,
  getAccessSessionState,
} from "@/lib/auth/server"
import { getLlmStatus } from "@/lib/llm/server"
import { getOnboardingSyncStatus } from "@/lib/onboarding/server"
import {
  addAccessAndReleaseResources,
  addAllowlistResources,
  addLlmResources,
  addOnboardingResources,
  createResourceCollector,
  type ResourceCollector,
} from "@/lib/system/resources/internalstate-sections"
import { updateOnboardingFromConfig } from "@/lib/onboarding/update"
import { getSystemReleaseStatus } from "@/lib/system/release"
import type { ResourceStatesModel } from "@/lib/system/resources/types"
import localConfig from "@/lib/system/config/local.cjs"

localConfig.loadLocalConfig()

const ONBOARDING_AUTO_SYNC_RETRY_COOLDOWN_MS = 30_000

let onboardingAutoSyncBlockedUntil = 0

function getOnboardingRepoUrl() {
  return process.env.ONBOARDING_REPO_URL?.trim() ?? ""
}

async function getOnboardingStatusWithAutoSync() {
  const onboardingRepoUrl = getOnboardingRepoUrl()
  let current = await getOnboardingSyncStatus()

  if (!onboardingRepoUrl || current.state !== "missing" || Date.now() < onboardingAutoSyncBlockedUntil) {
    return current
  }

  try {
    await updateOnboardingFromConfig()
    current = await getOnboardingSyncStatus()
    onboardingAutoSyncBlockedUntil = 0
  } catch {
    onboardingAutoSyncBlockedUntil = Date.now() + ONBOARDING_AUTO_SYNC_RETRY_COOLDOWN_MS
  }

  return current
}

function getLocalConfigCondition(localConfigState: ReturnType<typeof localConfig.getLocalConfigState>) {
  if (localConfigState.hasLegacyEnv) {
    return "legacyEnv"
  }

  return localConfigState.hasConfig ? "ready" : "missing"
}

function appendCollectedResources(target: ResourceCollector, source: ResourceCollector) {
  target.items.push(...source.items)
  target.instructions.push(...source.instructions)
}

/**
 * @example
 * ```ts
 * const model = await getResourceStates()
 * const llm = model.resources.find((resource) => resource.id === "llm")
 * ```
 */
export async function getResourceStates(): Promise<ResourceStatesModel> {
  const onboardingRepoUrl = getOnboardingRepoUrl()
  const [llmStatus, authState, onboardingContent, systemRelease] = await Promise.all([
    getLlmStatus(),
    getAccessSessionState(),
    getOnboardingStatusWithAutoSync(),
    getSystemReleaseStatus(),
  ])
  const hasAccess = authState === "valid"
  const accessConfig = getAccessControlConfig()
  const localConfigState = localConfig.getLocalConfigState()
  const resources = createResourceCollector()
  const llmResources = createResourceCollector()
  const allowlistResources = createResourceCollector()

  addAccessAndReleaseResources({
    resources,
    authState,
    accessConfig,
    localConfigCondition: getLocalConfigCondition(localConfigState),
    systemRelease,
  })
  await Promise.all([
    addLlmResources(llmResources, llmStatus),
    addAllowlistResources(allowlistResources, accessConfig),
  ])
  appendCollectedResources(resources, llmResources)
  appendCollectedResources(resources, allowlistResources)
  addOnboardingResources({ resources, onboardingRepoUrl, onboardingContent })

  return {
    llmStatus,
    items: resources.items,
    instructions: resources.instructions,
    allowlistConfigured: accessConfig.isConfigured,
    authState,
    hasAccess,
    onboardingRepoConfigured: Boolean(onboardingRepoUrl),
    onboardingSyncState: onboardingContent.state,
    readyForProtectedLab: hasAccess,
  }
}
