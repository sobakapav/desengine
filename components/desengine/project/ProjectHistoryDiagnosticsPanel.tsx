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
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">История проектной работы</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Этот слой показывает, как проект реально двигался: когда стартовала работа, как
            менялся фокус и какие компоненты уже вошли в готовый слой проекта.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">События</p>
          <p className="mt-2 text-2xl">{model.summary.eventCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Смены фокуса</p>
          <p className="mt-2 text-2xl">{model.summary.focusChangeCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Добавлено компонентов</p>
          <p className="mt-2 text-2xl">{model.summary.createdComponentCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Готово внутри проекта</p>
          <p className="mt-2 text-2xl">{model.summary.completedComponentCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Последняя активность</p>
          <p className="mt-2 text-base">{model.summary.lastActivityLabel}</p>
        </article>
      </div>

      {model.events.length === 0 ? (
        <p className="mt-6 text-lg text-black/70">
          История проектной работы пока пуста. Как только вы начнёте работу над проектом, добавите
          компонент или смените фокус, здесь появится наблюдаемый след.
        </p>
      ) : (
        <div className="mt-6 grid gap-3">
          {model.events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-black/10 bg-[#f8f4ea] p-4">
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
