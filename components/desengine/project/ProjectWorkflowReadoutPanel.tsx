"use client"

import Link from "next/link"

import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import { getTaskUrl } from "@/lib/task/navigation"

import { buildProjectWorkflowReadoutModel } from "./projectSurface"

type ProjectWorkflowReadoutPanelProps = {
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function EmptyWorkflowReadoutState() {
  return (
    <p className="mt-4 text-lg text-black/70">
      У проекта пока нет начатой работы по компонентам. Как только вы откроете работу хотя бы по
      одному компоненту, здесь появится краткая сводка по шагам и результатам.
    </p>
  )
}

function ProjectWorkflowReadoutPanel({
  workflowReadout,
}: ProjectWorkflowReadoutPanelProps) {
  const model = buildProjectWorkflowReadoutModel(workflowReadout)

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">Как идёт работа по компонентам</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Этот блок помогает быстро понять, какие работы уже запущены внутри проекта, на каком
            они шаге и к каким задачам привязаны.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Работы</p>
          <p className="mt-2 text-2xl">{model.summary.runCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Шаги</p>
          <p className="mt-2 text-2xl">{model.summary.workflowPointCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Результаты</p>
          <p className="mt-2 text-2xl">{model.summary.artifactCountLabel}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Рабочие поверхности</p>
          <p className="mt-2 text-2xl">{model.summary.workbenchCountLabel}</p>
        </article>
      </div>

      {model.entries.length === 0 ? (
        <EmptyWorkflowReadoutState />
      ) : (
        <div className="mt-6 grid gap-4 xl:grid-cols-2">
          {model.entries.map((entry) => (
            <article key={`${entry.taskId}:${entry.workflowStepTitle}`} className="rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-2xl">{entry.taskTitle}</h3>
                  <p className="mt-1 text-sm text-black/60">{entry.taskId}</p>
                </div>
                <span className="rounded-full border border-black/15 bg-white px-3 py-1 text-sm text-black/70">
                  {entry.runStatusLabel}
                </span>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-sm uppercase tracking-wide text-black/50">Ход работы</p>
                  <p className="mt-2 text-lg">{entry.runProgressLabel}</p>
                  <p className="mt-2 text-sm text-black/70">{entry.activeWorkflowPointLabel}</p>
                  <p className="mt-2 text-sm text-black/60">Последняя активность: {entry.lastActivityLabel}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-sm uppercase tracking-wide text-black/50">Текущий этап</p>
                  <p className="mt-2 text-lg">{entry.workflowStepTitle}</p>
                  <p className="mt-2 text-sm text-black/70">{entry.workflowStepStatusLabel}</p>
                  <p className="mt-2 text-sm text-black/70">{entry.bindingLabel}</p>
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
                <p className="text-sm uppercase tracking-wide text-black/50">Шаги работы</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {entry.workflowPointLabels.map((label) => (
                    <span key={label} className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-sm text-black/75">
                      {label}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-sm uppercase tracking-wide text-black/50">Результаты</p>
                  <p className="mt-2 text-sm text-black/70">{entry.artifactScopeLabel}</p>
                  <p className="mt-2 text-sm text-black/70">{entry.artifactKindsLabel}</p>
                  <p className="mt-2 text-sm text-black/75">{entry.artifactPreviewLabel}</p>
                </div>
                <div className="rounded-2xl border border-black/10 bg-white p-4">
                  <p className="text-sm uppercase tracking-wide text-black/50">Где идёт работа</p>
                  <p className="mt-2 text-base text-black/80">{entry.workbenchLabel}</p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link className="rounded-full border border-black px-4 py-2" href={getTaskUrl(entry.taskId)}>
                  Открыть задачу
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  )
}

export { ProjectWorkflowReadoutPanel }
