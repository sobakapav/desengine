"use client"

import type { FormEvent } from "react"

import type { AuthState } from "@/lib/auth/types"
import type { Resource } from "@/lib/system/types"
import AuthForm from "../auth/AuthForm"
import { OnboardingUpdateCard } from "./OnboardingUpdateCard"
import { SystemUpdateCard } from "./SystemUpdateCard"

type ResourceRemediationControlProps = {
  authState: AuthState
  configured: boolean
  email: string
  error: string
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void
  isPending: boolean
  onEmailChange: (email: string) => void
  resource: Resource
}

function ResourceRemediationControl({
  authState,
  configured,
  email,
  error,
  handleSubmit,
  isPending,
  onEmailChange,
  resource,
}: ResourceRemediationControlProps) {
  if (resource.remediationControl?.kind === "auth-form") {
    return (
      <AuthForm
        email={email}
        error={error}
        isPending={isPending}
        authState={authState}
        configured={configured}
        onEmailChange={onEmailChange}
        handleSubmit={handleSubmit}
      />
    )
  }

  if (resource.remediationControl?.kind === "onboarding-update") {
    return (
      <OnboardingUpdateCard
        canUpdate={resource.remediationControl.canUpdate}
        detail={resource.remediationControl.detail}
        syncState={resource.remediationControl.syncState}
      />
    )
  }

  if (resource.remediationControl?.kind === "system-update") {
    return (
      <SystemUpdateCard
        canUpdate={resource.remediationControl.canUpdate}
        currentVersion={resource.remediationControl.currentVersion}
        detail={resource.remediationControl.detail}
        latestVersion={resource.remediationControl.latestVersion}
      />
    )
  }

  return null
}

export {
  ResourceRemediationControl,
}
