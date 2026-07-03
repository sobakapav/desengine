"use client"

import { useState } from "react"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

import { ComponentsReadyState } from "./ProjectComponentsPanelContent"

type ProjectComponentsPanelProps = {
  components: ProjectComponent[]
  createComponent: (title: string) => Promise<ProjectComponent>
  markComponentCompleted: (componentId: string) => Promise<void>
  reopenComponent: (componentId: string) => Promise<void>
  stateStatus: "loading" | "ready" | "error"
  startComponentWork: (componentId: string) => Promise<void>
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
      <article className="shell-card-muted"><p className="shell-eyebrow">Всего компонентов</p><p className="mt-2 text-2xl">{counters.total}</p></article>
      <article className="shell-card-muted"><p className="shell-eyebrow">Ещё не включены</p><p className="mt-2 text-2xl">{counters.draft}</p></article>
      <article className="shell-card-muted"><p className="shell-eyebrow">В активной работе</p><p className="mt-2 text-2xl">{counters.inProgress}</p></article>
      <article className="shell-card-muted"><p className="shell-eyebrow">Готовы внутри проекта</p><p className="mt-2 text-2xl">{counters.completed}</p></article>
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
    <p className="shell-callout mt-4 text-sm">
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
    <div className="shell-section-muted mt-5">
      <h3 className="text-2xl">Добавить компонент в проект</h3>
      <p className="mt-2 text-base shell-prose-muted">
        Сначала проект получает состав компонентов. Затем пользователь может запускать работу по
        одному или нескольким компонентам параллельно.
      </p>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          className="shell-field"
          placeholder="Например, Product card"
          value={title}
          onChange={(event) => onTitleChange(event.target.value)}
        />
        <button
          className="shell-button disabled:cursor-not-allowed"
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
    return <p className="mt-4 text-lg text-black/70">Загружаем состав проекта и активные линии работы...</p>
  }

  if (stateStatus === "error") {
    return (
      <p className="shell-callout mt-4 text-lg">
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
  components,
  createComponent,
  markComponentCompleted,
  reopenComponent,
  stateStatus,
  startComponentWork,
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
      setMessage(`Компонент «${component.title}» добавлен в проект. Теперь по нему можно запустить рабочую линию.`)
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
    <section className="shell-section mt-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="shell-eyebrow">Project components</p>
          <h2 className="shell-subtitle mt-3">Компоненты проекта</h2>
          <p className="mt-2 max-w-4xl text-lg shell-prose-muted">
            Компоненты больше не запускают отдельные runtime-сессии. Они входят в единую работу над
            проектом и могут развиваться параллельно внутри одного проектного контура.
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
          components={components}
          onCompleteComponent={(componentId) => void markComponentCompleted(componentId)}
          onReopenComponent={(componentId) => void reopenComponent(componentId)}
          onStartComponentWork={(componentId) => void startComponentWork(componentId)}
          workflowReadout={workflowReadout}
        />
      ) : null}
    </section>
  )
}

export { ProjectComponentsPanel }
