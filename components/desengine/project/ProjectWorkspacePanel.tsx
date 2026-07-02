"use client"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectSession } from "@/lib/project/workspace-session"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

function resolveProjectSessionLabel(session: ProjectSession | null) {
  switch (session?.status) {
    case "completed":
      return "Проектная волна собрана"
    case "in_progress":
      return "Проект в активной работе"
    default:
      return "Работа над проектом ещё не запущена"
  }
}

function resolveWorkflowStageLabel(status: ProjectWorkflowReadoutSnapshot["stages"][number]["status"]) {
  switch (status) {
    case "completed":
      return "завершено"
    case "in_progress":
      return "в работе"
    default:
      return "ещё не начато"
  }
}

function ProjectWorkspacePanel({
  activeComponent,
  clearFocus,
  completedComponentCount,
  componentCount,
  session,
  startProjectWork,
  workflowReadout,
}: {
  activeComponent: ProjectComponent | null
  clearFocus: () => void
  completedComponentCount: number
  componentCount: number
  session: ProjectSession | null
  startProjectWork: () => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-[#f8f4ea] p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-4xl">Работа над проектом</h2>
          <p className="mt-3 max-w-4xl text-lg text-black/70">
            Проект здесь является единственной рабочей сущностью. Компоненты входят в проектную
            работу как текущий фокус, а не как отдельные изолированные задачи.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            className="rounded-full bg-black px-5 py-3 text-sm text-white"
            type="button"
            onClick={() => void startProjectWork()}
          >
            {session?.status === "idle" ? "Начать работу над проектом" : "Продолжить работу над проектом"}
          </button>
          {activeComponent ? (
            <button
              className="rounded-full border border-black px-5 py-3 text-sm"
              type="button"
              onClick={() => void clearFocus()}
            >
              Снять явный фокус
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Статус проекта</p>
          <p className="mt-2 text-2xl">{resolveProjectSessionLabel(session)}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Текущий фокус</p>
          <p className="mt-2 text-2xl">{activeComponent?.title ?? "Фокус ещё не выбран"}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Компоненты проекта</p>
          <p className="mt-2 text-2xl">{componentCount}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Готово внутри проекта</p>
          <p className="mt-2 text-2xl">{completedComponentCount}</p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="rounded-3xl border border-black/10 bg-white p-5">
          <h3 className="text-2xl">Project workflow</h3>
          <div className="mt-4 grid gap-3">
            {workflowReadout.stages.map((stage) => (
              <article key={stage.id} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong>{stage.title}</strong>
                  <span className="rounded-full border border-black/10 px-3 py-1 text-xs uppercase tracking-wide text-black/65">
                    {resolveWorkflowStageLabel(stage.status)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/70">{stage.description}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-black/10 bg-white p-5">
          <h3 className="text-2xl">Что сейчас происходит</h3>
          <p className="mt-3 text-base text-black/75">
            {workflowReadout.currentStageTitle}
          </p>
          <p className="mt-4 text-sm text-black/70">
            Последняя активность: {workflowReadout.lastActivityLabel}
          </p>
          <p className="mt-4 text-sm text-black/70">
            {activeComponent
              ? `Проект сейчас работает через компонент «${activeComponent.title}».`
              : componentCount > 0
                ? "У проекта уже есть компоненты, но текущий фокус ещё не выбран."
                : "Сначала добавьте первый компонент ниже, чтобы работа над проектом стала предметной."}
          </p>
        </div>
      </div>
    </section>
  )
}

export { ProjectWorkspacePanel }
