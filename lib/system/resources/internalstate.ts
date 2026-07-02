import "server-only"

import {
  getAccessControlConfig,
  getAccessSessionState,
} from "@/lib/auth/server"
import { getLlmStatus } from "@/lib/llm/server"
import {
  addAccessAndReleaseResources,
  addAllowlistResources,
  addLlmResources,
  createResourceCollector,
  type ResourceCollector,
} from "@/lib/system/resources/internalstate-sections"
import { getSystemReleaseStatus } from "@/lib/system/release"
import type { ResourceStatesModel } from "@/lib/system/resources/types"
import localConfig from "@/lib/system/config/local.cjs"

localConfig.loadLocalConfig()

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
  const [llmStatus, authState, systemRelease] = await Promise.all([
    getLlmStatus(),
    getAccessSessionState(),
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

  return {
    llmStatus,
    items: resources.items,
    instructions: resources.instructions,
    allowlistConfigured: accessConfig.isConfigured,
    authState,
    hasAccess,
    readyForProtectedLab: hasAccess,
  }
}
