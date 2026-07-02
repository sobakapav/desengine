"use client"

import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { getProjectsRootUrl } from "@/lib/project/navigation"
import { Instruction, Resource } from "@/lib/system/types"
import { ResourceCardList } from "./ResourceCardList"
import { AuthState } from "@/lib/auth/types"
import { ResourceRemediationControl } from "./ResourceRemediationControl"

type SystemScreenProps = {
  authState: AuthState
  configured: boolean
  resources: Resource[]
  instructions: Instruction[]
}

function SystemNavigationLinks() {
  return (
    <ul className="space-y-4">
<li className="text-2xl">
  <a href="/levels">Уровни</a>
</li>
<li className="text-2xl">
  <a href="/projects">Проекты</a>
</li>
<li className="text-2xl">
  <strong>
    <a href="/system">Система</a>
  </strong>
</li>
<li className="text-2xl">
  <a href="/help">Справка</a>
</li>
    </ul>
  )
}

/**
 * @example
 * ```tsx
 * <SystemScreen authState="missing" configured={false} resources={[]} instructions={[]} />
 * ```
 */
export function SystemScreen({
  authState,
  configured,
  resources,
  instructions }: SystemScreenProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    // TODO(owner:team-desengine, targetStage:6.5): убрать жёстко зашитые адреса.
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

      router.push(data.redirectTo || getProjectsRootUrl())
      router.refresh()
    })
  }

return (
  <main className="min-h-screen bg-background text-foreground">
    <div className="flex justify-center">
      <section className="grid min-h-screen grid-cols-[220px_36rem] gap-8 py-24">
        <aside>
          <SystemNavigationLinks />
        </aside>

        <div className="min-w-0">
          <ResourceCardList
            resources={resources}
            instructions={instructions}
          />
        </div>
      </section>
    </div>
  </main>
)
}
