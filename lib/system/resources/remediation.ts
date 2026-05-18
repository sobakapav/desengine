import type { AuthState } from "@/lib/auth/types"
import type { OnboardingSyncState } from "@/lib/onboarding/status"
import type { SystemReleaseStatus } from "@/lib/system/release"
import type { ResourceRemediationControl } from "@/lib/system/types"

function getAccessSessionRemediationControl(params: {
  accessConfigured: boolean
  authState: AuthState
}): ResourceRemediationControl | undefined {
  if (params.authState === "valid" || !params.accessConfigured) {
    return undefined
  }

  return {
    kind: "auth-form",
  }
}

function getOnboardingContentRemediationControl(params: {
  detail: string
  repoConfigured: boolean
  syncState: OnboardingSyncState
}): ResourceRemediationControl | undefined {
  if (params.syncState === "synced" || !params.repoConfigured) {
    return undefined
  }

  return {
    kind: "onboarding-update",
    canUpdate: true,
    detail: params.detail,
    syncState: params.syncState,
  }
}

function getSystemReleaseRemediationControl(
  status: SystemReleaseStatus,
): ResourceRemediationControl | undefined {
  if (status.condition !== "updateAvailable") {
    return undefined
  }

  return {
    kind: "system-update",
    canUpdate: status.canUpdate,
    currentVersion: status.currentVersion,
    detail: status.updateSafety,
    latestVersion: status.latestVersion,
  }
}

export {
  getAccessSessionRemediationControl,
  getOnboardingContentRemediationControl,
  getSystemReleaseRemediationControl,
}
