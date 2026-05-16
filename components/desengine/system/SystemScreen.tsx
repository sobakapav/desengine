"use client"

import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { getTasksRootUrl } from "@/lib/task/navigation"
import { Instruction, Resource } from "@/lib/system/types"
import { ResourceCardList } from "./ResourceCardList"
import { AuthScreen } from "../auth/AuthScreen"
import { AuthState } from "@/lib/auth/types"
import AuthForm from "../auth/AuthForm"
import ScreenSummary from "./ScreenSummary"

type ConfigScreenProps = {
  authState: AuthState
  configured: boolean
  resources: Resource[]
  instructions: Instruction[]
}

export function ConfigScreen({
  authState,
  configured,
  resources,
  instructions }: ConfigScreenProps) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const hasAccess = authState === "valid"

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    // TODO Убрать жёстко зашитые адреса
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
    <main className="tool-shell-page">
        <section className="flex m-5 gap-2 items-center">
          <div className="flex-1 p-8">
          <ul>
            <li className="text-4xl p-12"><strong><a href="/lab">Лаборатория</a></strong></li>
            <li className="text-4xl p-12"><a href="/levels">Уровни</a></li>
            <li className="text-4xl p-12"><a href="/tasks">Задачи</a></li>
            <li className="text-4xl p-12"><a href="/system">Система</a></li>
            <li className="text-4xl p-12"><a href="/help">Справка</a></li>

          </ul>

          </div>
          <div className="flex-1">
            <ResourceCardList
              resources={resources}
              instructions={instructions}
            />
          </div>
        </section>
    </main>
  )
}
