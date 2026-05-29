"use client"

import type { FormEvent } from "react"

import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

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
  helpHref?: string
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
  helpHref,
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

  return (
  <div className="max-w-xl">
    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
      Нужно исправить
    </p>

    <h2 className="mt-5 text-4xl font-bold leading-tight text-slate-900">
      {resource.label}
    </h2>

    <p className="mt-2 text-lg font-semibold leading-snug text-slate-800">
      {resource.summary}
    </p>

    <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
<div className="mt-1 text-base leading-relaxed text-slate-600">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    allowedElements={["p", "a", "code", "em", "strong", "ul", "ol", "li", "text"]}
    unwrapDisallowed
    components={{
      p: ({ children }) => (
        <p className="m-0">
          {children}
        </p>
      ),
      a: ({ href, children }) => (
        <a href={href} className="underline underline-offset-2">
          {children}
        </a>
      ),
      code: ({ children }) => (
        <code className="rounded bg-slate-100 px-1 py-0.5 text-sm text-slate-800">
          {children}
        </code>
      ),
    }}
  >
    {resource.detail}
  </ReactMarkdown>
</div>

{helpHref && resource.state === "blocked" ? (
  <a
    href={helpHref}
    className="mt-6 inline-flex text-sm font-medium text-slate-900 underline underline-offset-2"
  >
    Открыть справку
  </a>
) : null}

    </div>
  </div>
)
}

export {
  ResourceRemediationControl,
}
