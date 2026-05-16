"use client"

import { FormEvent, useState, useTransition } from "react"
import { useRouter } from "next/navigation"

import { getTasksRootUrl } from "@/lib/task/navigation"
import { Instruction, Resource } from "@/lib/system/types"
import { ResourceCardList } from "../system/ResourceCardList"
import ScreenSummary from "../system/ScreenSummary"
import AuthForm from "./AuthForm"
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
    <main>
      <section className="flex m-10 gap-10">         
        <div className="flex-1">
          <ScreenSummary
            title="Авторизация"
            description="Введите, пожалуйста, свой email"
          />
          <AuthForm
            email={email}
            error={error}
            isPending={isPending}
            authState={authState}
            configured={configured}
            onEmailChange={setEmail}
            handleSubmit={handleSubmit}
          />
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

export {
  AuthScreen
}
