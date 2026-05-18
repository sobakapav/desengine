import "server-only"

import { checkAllowlistSystemReachability } from "@/lib/auth/allowlist"
import {
  getAccessControlConfig,
  getAccessSessionState,
} from "@/lib/auth/server"
import { getLlmStatus } from "@/lib/llm/server"
import { getOnboardingSyncStatus } from "@/lib/onboarding/server"
import {
  getAccessSessionRemediationControl,
  getOnboardingContentRemediationControl,
  getSystemReleaseRemediationControl,
} from "@/lib/system/resources/remediation"
import { updateOnboardingFromConfig } from "@/lib/onboarding/update"
import { getSystemReleaseStatus } from "@/lib/system/release"
import { resolveResourceStatus } from "@/lib/system/resources/publicstate"
import type { ResourceStatesModel } from "@/lib/system/resources/types"
import type { Instruction, Resource, ResourceId, ResourceRemediationControl } from "@/lib/system/types"
import localConfig from "@/lib/system/config/local.cjs"

localConfig.loadLocalConfig()

const ONBOARDING_AUTO_SYNC_RETRY_COOLDOWN_MS = 30_000

let onboardingAutoSyncBlockedUntil = 0

type ReachabilityResult = {
  ok: boolean
  status?: number
  message: string
}

type ResourceCollector = {
  items: Resource[]
  instructions: Instruction[]
  add: (
    id: ResourceId,
    condition: string,
    values?: Parameters<typeof resolveResourceStatus>[0]["values"],
    remediationControl?: ResourceRemediationControl,
  ) => void
}

function createResourceCollector(): ResourceCollector {
  const items: Resource[] = []
  const instructions: Instruction[] = []

  return {
    items,
    instructions,
    add(id, condition, values, remediationControl) {
      const resolved = resolveResourceStatus({ id, condition, values })
      items.push({
        ...resolved.resource,
        ...(remediationControl ? { remediationControl } : {}),
      })

      if (resolved.instruction) {
        instructions.push(resolved.instruction)
      }
    },
  }
}

function getOnboardingRepoUrl() {
  return process.env.ONBOARDING_REPO_URL?.trim() ?? ""
}

function getHttpCondition(status: number) {
  if (status >= 200 && status < 300) {
    return "ready"
  }

  if (status === 401 || status === 403) {
    return "rejected"
  }

  return "unexpected"
}

function getAllowlistNetworkCondition(status: number) {
  if (status === 200) {
    return "ready"
  }

  if (status === 401 || status === 403) {
    return "rejected"
  }

  if (status === 404) {
    return "notFound"
  }

  return "unexpected"
}

async function fetchReachability(url: string, init?: RequestInit): Promise<ReachabilityResult> {
  try {
    const response = await fetch(url, {
      ...init,
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    })

    return {
      ok: response.ok,
      status: response.status,
      message: `HTTP ${response.status}`,
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Сетевой запрос завершился ошибкой",
    }
  }
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

function getAccessCondition(params: {
  authState: Awaited<ReturnType<typeof getAccessSessionState>>
  accessConfigured: boolean
}) {
  if (params.authState === "valid") {
    return "valid"
  }

  if (params.authState === "expired") {
    return "expired"
  }

  return params.accessConfigured ? "missingConfigured" : "missingUnconfigured"
}

function getLocalConfigCondition(localConfigState: ReturnType<typeof localConfig.getLocalConfigState>) {
  if (localConfigState.hasLegacyEnv) {
    return "legacyEnv"
  }

  return localConfigState.hasConfig ? "ready" : "missing"
}

function getOnboardingSyncInstruction(onboardingRepoUrl: string) {
  return onboardingRepoUrl
    ? "Система пытается синхронизировать `/onboarding` автоматически. Если статус не меняется, используйте `Обновить onboarding` на [`/system`](/system) или `npm run smoke`."
    : "Сначала задайте `ONBOARDING_REPO_URL` в `desengine.config.txt`, затем запустите повторную синхронизацию `/onboarding`."
}

function getReleaseVersionText(version: string | null) {
  return version ?? "нет точного релизного тега"
}

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
  const missingEnvVarsText =
    llmStatus.config.missingEnvVars.length > 0
      ? ` Не хватает: ${llmStatus.config.missingEnvVars.join(", ")}.`
      : ""
  const legacyPathsText =
    onboardingContent.legacyPaths.length > 0
      ? ` Legacy-каталоги ${onboardingContent.legacyPaths.join(", ")} не используются как fallback.`
      : ""
  const onboardingDetail = `${onboardingContent.detail}${legacyPathsText}`

  resources.add("access-session", getAccessCondition({
    authState,
    accessConfigured: accessConfig.isConfigured,
  }), undefined, getAccessSessionRemediationControl({
    authState,
    accessConfigured: accessConfig.isConfigured,
  }))
  resources.add("local-config-file", getLocalConfigCondition(localConfigState))
  resources.add("system-release", systemRelease.condition, {
    branch: systemRelease.branch,
    currentVersion: getReleaseVersionText(systemRelease.currentVersion),
    latestVersion: systemRelease.latestVersion ?? "неизвестен",
    message: systemRelease.message,
    nearestVersion: systemRelease.nearestVersion ?? "не найден",
    remoteUrl: systemRelease.remoteUrl ?? "origin не настроен",
    updateSafety: systemRelease.updateSafety,
  }, getSystemReleaseRemediationControl(systemRelease))
  resources.add("llm-config", llmStatus.ready ? "ready" : "incomplete", {
    activeProvider: llmStatus.config.activeProvider,
    availabilityMessage: llmStatus.availability.message,
    missingEnvVarsText,
    providerLabel: llmStatus.label,
  })

  if (llmStatus.config.hasRequiredKey) {
    const networkUrl = `${llmStatus.endpoint}/models`
    const providerNetwork = await fetchReachability(networkUrl, {
      headers:
        llmStatus.provider === "gemini"
          ? {
              "x-goog-api-key": process.env.GEMINI_API_KEY ?? "",
            }
          : {
              authorization: `Bearer ${
                llmStatus.provider === "deepseek" ? process.env.DEEPSEEK_API_KEY : process.env.OPENAI_API_KEY
              }`,
            },
    })

    resources.add(
      "llm-network",
      providerNetwork.status ? getHttpCondition(providerNetwork.status) : "unavailable",
      {
        activeProvider: llmStatus.config.activeProvider,
        message: providerNetwork.message,
        providerLabel: llmStatus.label,
        status: providerNetwork.status,
      },
    )
  } else {
    resources.add("llm-network", "skipped", {
      activeProvider: llmStatus.config.activeProvider,
      providerLabel: llmStatus.label,
    })
  }

  resources.add("allowlist-config", accessConfig.isConfigured ? "ready" : "missing")
  if (accessConfig.isConfigured) {
    const allowlistNetwork = await checkAllowlistSystemReachability(accessConfig.baseUrl)
    resources.add(
      "allowlist-network",
      allowlistNetwork.status ? getAllowlistNetworkCondition(allowlistNetwork.status) : "unavailable",
      {
        message: allowlistNetwork.message,
        status: allowlistNetwork.status,
      },
    )
  } else {
    resources.add("allowlist-network", "skipped")
  }

  resources.add("onboarding-config", onboardingRepoUrl ? "ready" : "missing", {
    repoUrl: onboardingRepoUrl,
  })
  resources.add("onboarding-content", onboardingContent.state, {
    detail: onboardingContent.detail,
    legacyPathsText,
    summary: onboardingContent.summary,
    syncInstruction: getOnboardingSyncInstruction(onboardingRepoUrl),
  }, getOnboardingContentRemediationControl({
    detail: onboardingDetail,
    repoConfigured: Boolean(onboardingRepoUrl),
    syncState: onboardingContent.state,
  }))

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
