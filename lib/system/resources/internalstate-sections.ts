import { checkAllowlistSystemReachability } from "@/lib/auth/allowlist"
import type { LlmProvider } from "@/lib/llm/types"
import {
  getAccessSessionRemediationControl,
  getOnboardingContentRemediationControl,
  getSystemReleaseRemediationControl,
} from "@/lib/system/resources/remediation"
import { resolveResourceStatus } from "@/lib/system/resources/publicstate"
import type { getAccessControlConfig, getAccessSessionState } from "@/lib/auth/server"
import type { getLlmStatus } from "@/lib/llm/server"
import type { getOnboardingSyncStatus } from "@/lib/onboarding/server"
import type { getSystemReleaseStatus } from "@/lib/system/release"
import type { Instruction, Resource, ResourceId, ResourceRemediationControl } from "@/lib/system/types"

type LlmStatus = Awaited<ReturnType<typeof getLlmStatus>>
type AuthState = Awaited<ReturnType<typeof getAccessSessionState>>
type AccessConfig = ReturnType<typeof getAccessControlConfig>
type OnboardingContent = Awaited<ReturnType<typeof getOnboardingSyncStatus>>
type SystemRelease = Awaited<ReturnType<typeof getSystemReleaseStatus>>

type ReachabilityResult = {
  ok: boolean
  status?: number
  message: string
}

type LlmProbeDefinition = {
  url: string
  init?: RequestInit
}

type LlmProbeHeaders = NonNullable<RequestInit["headers"]>

export type ResourceCollector = {
  items: Resource[]
  instructions: Instruction[]
  add: (
    id: ResourceId,
    condition: string,
    values?: Parameters<typeof resolveResourceStatus>[0]["values"],
    remediationControl?: ResourceRemediationControl,
  ) => void
}

export function createResourceCollector(): ResourceCollector {
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

function getHttpCondition(status: number) {
  if (status >= 200 && status < 300) return "ready"
  if (status === 401 || status === 403) return "rejected"
  return "unexpected"
}

function getAllowlistNetworkCondition(status: number) {
  if (status === 200) return "ready"
  if (status === 401 || status === 403) return "rejected"
  if (status === 404) return "notFound"
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

function getProviderApiKey(provider: LlmProvider): string {
  switch (provider) {
    case "openai":
      return process.env.OPENAI_API_KEY ?? ""
    case "deepseek":
      return process.env.DEEPSEEK_API_KEY ?? ""
    case "gemini":
      return process.env.GEMINI_API_KEY ?? ""
    case "claude":
      return process.env.CLAUDE_API_KEY ?? ""
    case "zai":
      return process.env.ZAI_API_KEY ?? ""
  }
}

function buildGetProbe(url: string, headers: LlmProbeHeaders): LlmProbeDefinition {
  return {
    url,
    init: { headers },
  }
}

function buildPostProbe(
  url: string,
  headers: LlmProbeHeaders,
  body: Record<string, unknown>,
): LlmProbeDefinition {
  return {
    url,
    init: {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    },
  }
}

function buildLlmProbeDefinition(llmStatus: LlmStatus): LlmProbeDefinition {
  switch (llmStatus.provider) {
    case "openai":
      return buildGetProbe(`${llmStatus.endpoint}/models`, {
        authorization: `Bearer ${getProviderApiKey("openai")}`,
      })
    case "deepseek":
      return buildGetProbe(`${llmStatus.endpoint}/models`, {
        authorization: `Bearer ${getProviderApiKey("deepseek")}`,
      })
    case "gemini":
      return buildGetProbe(`${llmStatus.endpoint}/models/${llmStatus.config.model}`, {
        "x-goog-api-key": getProviderApiKey("gemini"),
      })
    case "claude":
      return buildPostProbe(
        `${llmStatus.endpoint}/messages`,
        {
          "anthropic-version": "2023-06-01",
          "content-type": "application/json",
          "x-api-key": getProviderApiKey("claude"),
        },
        {
          model: llmStatus.config.model,
          max_tokens: 1,
          messages: [
            {
              role: "user",
              content: [{ type: "text", text: "ping" }],
            },
          ],
        },
      )
    case "zai":
      return buildPostProbe(
        `${llmStatus.endpoint}/chat/completions`,
        {
          authorization: `Bearer ${getProviderApiKey("zai")}`,
          "content-type": "application/json",
        },
        {
          model: llmStatus.config.model,
          messages: [{ role: "user", content: "ping" }],
          response_format: { type: "json_object" },
          stream: false,
        },
      )
  }
}

export function getAccessCondition(params: {
  authState: AuthState
  accessConfigured: boolean
}) {
  if (params.authState === "valid") return "valid"
  if (params.authState === "expired") return "expired"
  return params.accessConfigured ? "missingConfigured" : "missingUnconfigured"
}

export function getOnboardingSyncInstruction(onboardingRepoUrl: string) {
  return onboardingRepoUrl
    ? "Система пытается синхронизировать `/onboarding` автоматически. Если статус не меняется, используйте `Обновить onboarding` на [`/system`](/system) или `npm run smoke`."
    : "Сначала задайте `ONBOARDING_REPO_URL` в `desengine.config.txt`, затем запустите повторную синхронизацию `/onboarding`."
}

function getReleaseVersionText(version: string | null) {
  return version ?? "нет точного релизного тега"
}

export function addAccessAndReleaseResources(args: {
  resources: ResourceCollector
  authState: AuthState
  accessConfig: AccessConfig
  localConfigCondition: string
  systemRelease: SystemRelease
}) {
  args.resources.add("access-session", getAccessCondition({
    authState: args.authState,
    accessConfigured: args.accessConfig.isConfigured,
  }), undefined, getAccessSessionRemediationControl({
    authState: args.authState,
    accessConfigured: args.accessConfig.isConfigured,
  }))
  args.resources.add("local-config-file", args.localConfigCondition)
  args.resources.add("system-release", args.systemRelease.condition, {
    branch: args.systemRelease.branch,
    currentVersion: getReleaseVersionText(args.systemRelease.currentVersion),
    dirtyWorkspaceNote: args.systemRelease.dirtyWorkspaceNote ?? "",
    latestVersion: args.systemRelease.latestVersion ?? "неизвестен",
    message: args.systemRelease.message,
    nearestVersion: args.systemRelease.nearestVersion ?? "не найден",
    remoteUrl: args.systemRelease.remoteUrl ?? "origin не настроен",
    updateSafety: args.systemRelease.updateSafety,
  }, getSystemReleaseRemediationControl(args.systemRelease))
}

/**
 * @example
 * ```ts
 * await addLlmResources(resources, llmStatus)
 * ```
 */
export async function addLlmResources(resources: ResourceCollector, llmStatus: LlmStatus) {
  const missingEnvVarsText =
    llmStatus.config.missingEnvVars.length > 0
      ? ` Не хватает: ${llmStatus.config.missingEnvVars.join(", ")}.`
      : ""

  resources.add("llm-config", llmStatus.ready ? "ready" : "incomplete", {
    activeProvider: llmStatus.config.activeProvider,
    availabilityMessage: llmStatus.availability.message,
    missingEnvVarsText,
    providerLabel: llmStatus.label,
  })

  if (!llmStatus.config.hasRequiredKey) {
    resources.add("llm-network", "skipped", {
      activeProvider: llmStatus.config.activeProvider,
      providerLabel: llmStatus.label,
    })
    return
  }

  const probe = buildLlmProbeDefinition(llmStatus)
  const providerNetwork = await fetchReachability(probe.url, probe.init)

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
}

/**
 * @example
 * ```ts
 * await addAllowlistResources(resources, accessConfig)
 * ```
 */
export async function addAllowlistResources(resources: ResourceCollector, accessConfig: AccessConfig) {
  resources.add("allowlist-config", accessConfig.isConfigured ? "ready" : "missing")
  if (!accessConfig.isConfigured) {
    resources.add("allowlist-network", "skipped")
    return
  }

  const allowlistNetwork = await checkAllowlistSystemReachability(accessConfig.baseUrl)
  resources.add(
    "allowlist-network",
    allowlistNetwork.status ? getAllowlistNetworkCondition(allowlistNetwork.status) : "unavailable",
    {
      message: allowlistNetwork.message,
      status: allowlistNetwork.status,
    },
  )
}

export function addOnboardingResources(args: {
  resources: ResourceCollector
  onboardingRepoUrl: string
  onboardingContent: OnboardingContent
}) {
  const legacyPathsText =
    args.onboardingContent.legacyPaths.length > 0
      ? ` Legacy-каталоги ${args.onboardingContent.legacyPaths.join(", ")} не используются как fallback.`
      : ""
  const onboardingDetail = `${args.onboardingContent.detail}${legacyPathsText}`

  args.resources.add("onboarding-config", args.onboardingRepoUrl ? "ready" : "missing", {
    repoUrl: args.onboardingRepoUrl,
  })
  args.resources.add("onboarding-content", args.onboardingContent.state, {
    detail: args.onboardingContent.detail,
    legacyPathsText,
    summary: args.onboardingContent.summary,
    syncInstruction: getOnboardingSyncInstruction(args.onboardingRepoUrl),
  }, getOnboardingContentRemediationControl({
    detail: onboardingDetail,
    repoConfigured: Boolean(args.onboardingRepoUrl),
    syncState: args.onboardingContent.state,
  }))
}
