"use client"

import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"

import { buildProjectHistoryDiagnosticsModel } from "./projectSurface"

type ProjectHistoryDiagnosticsPanelProps = {
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
}

function ProjectHistoryDiagnosticsPanel({
  historyDiagnostics,
}: ProjectHistoryDiagnosticsPanelProps) {
  const model = buildProjectHistoryDiagnosticsModel(historyDiagnostics)

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">History</p>
          <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">История проектной работы</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/72">
            Этот слой показывает, как проект реально двигался: когда стартовала работа, как
            запускались линии по компонентам и какие части уже вошли в готовый слой проекта.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="shell-card-muted border border-black bg-neutral-50 p-4">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">События</p>
          <p className="mt-2 text-2xl">{model.summary.eventCountLabel}</p>
        </article>
        <article className="shell-card-muted border border-black bg-neutral-50 p-4">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Запуски линий</p>
          <p className="mt-2 text-2xl">{model.summary.startedComponentCountLabel}</p>
        </article>
        <article className="shell-card-muted border border-black bg-neutral-50 p-4">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Добавлено компонентов</p>
          <p className="mt-2 text-2xl">{model.summary.createdComponentCountLabel}</p>
        </article>
        <article className="shell-card-muted border border-black bg-neutral-50 p-4">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Готово внутри проекта</p>
          <p className="mt-2 text-2xl">{model.summary.completedComponentCountLabel}</p>
        </article>
        <article className="shell-card-muted border border-black bg-neutral-50 p-4">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Последняя активность</p>
          <p className="mt-2 text-base">{model.summary.lastActivityLabel}</p>
        </article>
      </div>

      {model.events.length === 0 ? (
        <p className="mt-6 text-lg text-black/70">
          История проектной работы пока пуста. Как только вы начнёте работу над проектом, добавите
          компонент или запустите по нему линию, здесь появится наблюдаемый след.
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {model.events.map((event) => (
            <article key={event.id} className="shell-card-muted border border-black bg-neutral-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{event.kindLabel}</strong>
                <span className="text-sm text-black/60">{event.createdAtLabel}</span>
              </div>
              <p className="mt-2 text-sm text-black/70">{event.componentLabel}</p>
              <p className="mt-3 text-base text-black/85">{event.message}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export { ProjectHistoryDiagnosticsPanel }
