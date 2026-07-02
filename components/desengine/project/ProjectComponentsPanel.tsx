"use client"

import { useState } from "react"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

import { ComponentsReadyState } from "./ProjectComponentsPanelContent"

type ProjectComponentsPanelProps = {
  activeComponentId: string | null
  components: ProjectComponent[]
  createComponent: (title: string) => Promise<ProjectComponent>
  markComponentCompleted: (componentId: string) => Promise<void>
  focusComponent: (componentId: string) => Promise<void>
  reopenComponent: (componentId: string) => Promise<void>
  stateStatus: "loading" | "ready" | "error"
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function buildProjectComponentCounters(components: ProjectComponent[]) {
  return {
    total: components.length,
    draft: components.filter((component) => component.status === "draft").length,
    inProgress: components.filter((component) => component.status === "in_progress").length,
    completed: components.filter((component) => component.status === "completed").length,
  }
}

function ComponentCounters({ counters }: { counters: ReturnType<typeof buildProjectComponentCounters> }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-4">
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Всего компонентов</p><p className="mt-2 text-2xl">{counters.total}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Ещё не включены</p><p className="mt-2 text-2xl">{counters.draft}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">В активной работе</p><p className="mt-2 text-2xl">{counters.inProgress}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Готовы внутри проекта</p><p className="mt-2 text-2xl">{counters.completed}</p></article>
    </div>
  )
}

function ComponentCreateStateMessage({
  createState,
  message,
}: {
  createState: "idle" | "creating" | "error"
  message: string
}) {
  if (!message) {
    return null
  }

  return (
    <p className={`mt-4 rounded-2xl border p-4 text-sm ${createState === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-black/10 bg-white text-black/80"}`}>
      {message}
    </p>
  )
}

function ProjectComponentCreatePanel({
  createState,
  message,
  onCreate,
  onTitleChange,
  title,
}: {
  createState: "idle" | "creating" | "error"
  message: string
  onCreate: () => void
  onTitleChange: (value: string) => void
  title: string
}) {
  return (
    <div className="mt-5 rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
      <h3 className="text-2xl">Добавить компонент в проект</h3>
      <p className="mt-2 text-base text-black/70">
        Сначала проект получает состав компонентов. Только потом работа над проектом выбирает,
        какой из них станет текущим рабочим фокусом.
      </p>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base"
          placeholder="Например, Product card"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <button
          className="rounded-full bg-black px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-black/40"
          disabled={createState === "creating"}
          type="button"
          onClick={onCreate}
        >
          {createState === "creating" ? "Добавляем…" : "Добавить компонент"}
        </button>
      </div>
      <ComponentCreateStateMessage createState={createState} message={message} />
    </div>
  )
}

function ProjectComponentsStateMessage({
  componentCount,
  stateStatus,
}: {
  componentCount: number
  stateStatus: "loading" | "ready" | "error"
}) {
  if (stateStatus === "loading") {
    return <p className="mt-4 text-lg text-black/70">Загружаем состав проекта и текущий рабочий фокус...</p>
  }

  if (stateStatus === "error") {
    return (
      <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-lg text-red-900">
        Не удалось прочитать рабочее состояние проекта.
      </p>
    )
  }

  if (stateStatus === "ready" && componentCount === 0) {
    return (
      <p className="mt-4 text-lg text-black/70">
        В проекте ещё нет компонентов. Добавьте первый компонент, чтобы работа над проектом стала
        конкретной и наблюдаемой.
      </p>
    )
  }

  return null
}

function ProjectComponentsPanel({
  activeComponentId,
  components,
  createComponent,
  focusComponent,
  markComponentCompleted,
  reopenComponent,
  stateStatus,
  workflowReadout,
}: ProjectComponentsPanelProps) {
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [createState, setCreateState] = useState<"idle" | "creating" | "error">("idle")
  const counters = buildProjectComponentCounters(components)

  async function handleCreate() {
    if (!title.trim()) {
      setCreateState("error")
      setMessage("Введите имя компонента, чтобы добавить новую рабочую часть в проект.")
      return
    }

    setCreateState("creating")
    setMessage("")

    try {
      const component = await createComponent(title)
      setTitle("")
      setCreateState("idle")
      setMessage(`Компонент «${component.title}» добавлен в проект. Теперь его можно сделать явным фокусом всей работы.`)
    } catch (error) {
      setCreateState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось создать компонент проекта.")
    }
  }

  function handleTitleChange(value: string) {
    setTitle(value)
    setCreateState("idle")
    setMessage("")
  }

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">Компоненты проекта</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Компоненты больше не запускают отдельные runtime-сессии. Они входят в единую работу над
            проектом и могут становиться текущим фокусом этого проекта.
          </p>
        </div>
      </div>

      <ComponentCounters counters={counters} />
      <ProjectComponentCreatePanel
        createState={createState}
        message={message}
        onCreate={() => void handleCreate()}
        onTitleChange={handleTitleChange}
        title={title}
      />
      <ProjectComponentsStateMessage componentCount={components.length} stateStatus={stateStatus} />

      {components.length > 0 ? (
        <ComponentsReadyState
          activeComponentId={activeComponentId}
          components={components}
          onCompleteComponent={(componentId) => void markComponentCompleted(componentId)}
          onFocusComponent={(componentId) => void focusComponent(componentId)}
          onReopenComponent={(componentId) => void reopenComponent(componentId)}
          workflowReadout={workflowReadout}
        />
      ) : null}
    </section>
  )
}

export { ProjectComponentsPanel }
