"use client"

import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { getTasksRootUrl } from "@/lib/task/navigation"
import { Instruction, Resource } from "@/lib/system/types"
import { ResourceCardList } from "../system/ResourceCardList"
import { ResourceRemediationControl } from "../system/ResourceRemediationControl"
import { AuthState } from "@/lib/auth/types"

type AuthScreenProps = {
  authState: AuthState
  configured: boolean
  resources: Resource[]
  instructions: Instruction[]
}

function AuthScreen({
  authState, 
  configured, 
  resources, 
  instructions 
} : AuthScreenProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()


const activeResource =
  resources.find(
    (resource) =>
      resource.state === "blocked" &&
      resource.id === "local-config-file"
  ) ||
  resources.find(
    (resource) =>
      resource.state === "blocked" &&
      resource.id === "llm-network"
  ) ||
  resources.find(
    (resource) =>
      resource.state === "blocked" &&
      resource.id === "llm-config"
  ) ||
  resources.find(
    (resource) =>
      resource.state === "blocked" &&
      resource.id === "allowlist-config"
  ) ||
  resources.find(
    (resource) =>
      resource.state === "blocked" &&
      resource.id === "allowlist-network"
  ) ||
  resources.find(
    (resource) =>
      resource.state === "blocked" &&
      resource.id !== "access-session"
  ) ||
  resources.find((resource) => resource.state === "blocked") ||
  resources.find((resource) => resource.state === "warning") ||
  resources[0]

  const helpLinksByResourceId: Partial<Record<Resource["id"], string>> = {
  "llm-config": "/help/llm-api-keys",
  "llm-network": "/help/llm-api-keys",
  "system-release": "/help/version-error",
  "onboarding-config": "/help/onboarding-config",
  "onboarding-content": "/help/onboarding-config",
}

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    startTransition(async () => {
      const response = await fetch("/api/auth/verify", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = (await response.json().catch(() => null)) as
        | { ok?: boolean; error?: string; redirectTo?: string }
        | null

      if (!response.ok || !data?.ok) {
        setError(data?.error || "Не удалось проверить доступ.")
        return
      }

      router.push(data.redirectTo || getTasksRootUrl())
      router.refresh()
    })
  }

return (
  <main className="min-h-screen bg-slate-800 text-white">
    <section className="grid min-h-screen w-full grid-cols-[360px_1fr] gap-16 px-32 py-16 ">
<div>
  <ResourceCardList
    resources={resources}
    instructions={instructions}
  />
</div>

<div className="min-h-[640px] rounded-xl bg-white p-12 text-slate-900">
  {activeResource ? (
<ResourceRemediationControl
  email={email}
  error={error}
  isPending={isPending}
  authState={authState}
  configured={configured}
  onEmailChange={setEmail}
  handleSubmit={handleSubmit}
  resource={activeResource}
  helpHref={helpLinksByResourceId[activeResource.id]}
/>
  ) : null}
</div>
    </section>
  </main>
)
}

export {
  AuthScreen
}
