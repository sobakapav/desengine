"use client"

import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { getTasksRootUrl } from "@/lib/task/navigation"
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
    <ul>
      <li className="text-4xl p-12"><strong><a href="/lab">Лаборатория</a></strong></li>
      <li className="text-4xl p-12"><a href="/levels">Уровни</a></li>
      <li className="text-4xl p-12"><a href="/tasks">Задачи</a></li>
      <li className="text-4xl p-12"><a href="/system">Система</a></li>
      <li className="text-4xl p-12"><a href="/help">Справка</a></li>
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

      router.push(data.redirectTo || getTasksRootUrl())
      router.refresh()
    })
  }

  return (
    <main>
        <section className="flex m-5 gap-2 items-center">
          <div className="flex-1 p-8">
            <SystemNavigationLinks />
          </div>
          <div className="flex-1">
            <ResourceCardList
              resources={resources}
              instructions={instructions}
              renderRemediationControl={(resource) => {
                return (
                  <ResourceRemediationControl
                    email={email}
                    error={error}
                    isPending={isPending}
                    authState={authState}
                    configured={configured}
                    onEmailChange={setEmail}
                    handleSubmit={handleSubmit}
                    resource={resource}
                  />
                )
              }}
            />
          </div>
        </section>
    </main>
  )
}
