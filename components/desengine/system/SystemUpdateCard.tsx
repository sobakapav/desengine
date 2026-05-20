"use client"

import { useRouter } from "next/navigation"
import { useState, useTransition } from "react"

import { Button } from "@/components/ui/button"

type SystemUpdateCardProps = {
  canUpdate: boolean
  currentVersion: string | null
  detail: string
  latestVersion: string | null
}

type UpdateState =
  | { kind: "idle" }
  | { kind: "success"; message: string }
  | { kind: "error"; message: string }

function useSystemUpdate(latestVersion: string | null) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [updateState, setUpdateState] = useState<UpdateState>({ kind: "idle" })

  function handleUpdate() {
    startTransition(async () => {
      setUpdateState({ kind: "idle" })

      try {
        const response = await fetch("/api/system/update", {
          method: "POST",
        })
        const payload = await response.json().catch(() => null) as
          | { ok?: boolean; error?: string; latestVersion?: string | null }
          | null

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.error || "Не удалось обновить систему.")
        }

        setUpdateState({
          kind: "success",
          message: `Система обновлена до ${payload.latestVersion ?? latestVersion}. Перезапустите сервер, чтобы работать уже с новым кодом.`,
        })
        router.refresh()
      } catch (error) {
        setUpdateState({
          kind: "error",
          message: error instanceof Error ? error.message : "Не удалось обновить систему.",
        })
      }
    })
  }

  return { handleUpdate, isPending, updateState }
}

function SystemUpdateMessages({
  canUpdate,
  updateState,
}: {
  canUpdate: boolean
  updateState: UpdateState
}) {
  return (
    <>
      {!canUpdate ? (
        <p className="tool-notice-warning mt-4">
          Автоматическое обновление отключено для текущего Git-состояния. В режиме разработки это нормально.
        </p>
      ) : null}

      {updateState.kind === "success" ? (
        <p className="tool-notice-success mt-4">{updateState.message}</p>
      ) : null}

      {updateState.kind === "error" ? (
        <p className="tool-notice-error mt-4">{updateState.message}</p>
      ) : null}
    </>
  )
}

function SystemUpdateCard({
  canUpdate,
  currentVersion,
  detail,
  latestVersion,
}: SystemUpdateCardProps) {
  const { handleUpdate, isPending, updateState } = useSystemUpdate(latestVersion)

  return (
    <section className="tool-panel mt-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h2 className="font-semibold text-black">Обновить систему</h2>
          <p className="max-w-2xl text-black/60">
            Текущая версия: {currentVersion ?? "не определена"}. Новый релиз: {latestVersion ?? "не найден"}.
          </p>
          <p className={canUpdate ? "tool-notice-warning" : "tool-notice-error"}>
            {detail}
          </p>
        </div>

        <Button
          className="min-w-[220px]"
          disabled={!canUpdate || isPending}
          onClick={handleUpdate}
          size="lg"
        >
          {isPending ? "Обновляем..." : "Обновить"}
        </Button>
      </div>

      <SystemUpdateMessages canUpdate={canUpdate} updateState={updateState} />
    </section>
  )
}

export {
  SystemUpdateCard,
}
