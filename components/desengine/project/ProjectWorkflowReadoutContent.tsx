"use client"

import Link from "next/link"

import { getTaskUrl } from "@/lib/task/navigation"

import { buildProjectWorkflowReadoutModel } from "./projectSurface"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

type WorkflowReadoutContentProps = {
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function WorkflowReadoutSummary({ model }: { model: ReturnType<typeof buildProjectWorkflowReadoutModel> }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Работы</p><p className="mt-2 text-2xl">{model.summary.runCountLabel}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Шаги</p><p className="mt-2 text-2xl">{model.summary.workflowPointCountLabel}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Результаты</p><p className="mt-2 text-2xl">{model.summary.artifactCountLabel}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Рабочие поверхности</p><p className="mt-2 text-2xl">{model.summary.workbenchCountLabel}</p></article>
    </div>
  )
}

function WorkflowReadoutCard({ entry, index }: { entry: ReturnType<typeof buildProjectWorkflowReadoutModel>["entries"][number], index: number }) {
  return (
    <article key={`${entry.taskId}:${entry.workflowStepTitle}:${index}`} className="rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl">{entry.taskTitle}</h3>
          <p className="mt-1 text-sm text-black/60">{entry.taskId}</p>
        </div>
        <span className="rounded-full border border-black/15 bg-white px-3 py-1 text-sm text-black/70">{entry.runStatusLabel}</span>
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
            <span key={label} className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-sm text-black/75">{label}</span>
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
  )
}

function WorkflowReadoutEntries({ model }: { model: ReturnType<typeof buildProjectWorkflowReadoutModel> }) {
  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {model.entries.map((entry, index) => <WorkflowReadoutCard key={`${entry.taskId}:${entry.workflowStepTitle}:${index}`} entry={entry} index={index} />)}
    </div>
  )
}

function WorkflowReadoutContent({ workflowReadout }: WorkflowReadoutContentProps) {
  const model = buildProjectWorkflowReadoutModel(workflowReadout)

  return (
    <>
      <WorkflowReadoutSummary model={model} />
      {model.entries.length === 0 ? (
        <p className="mt-4 text-lg text-black/70">
          У проекта пока нет начатой работы по компонентам. Как только вы откроете работу хотя бы по
          одному компоненту, здесь появится краткая сводка по шагам и результатам.
        </p>
      ) : (
        <WorkflowReadoutEntries model={model} />
      )}
    </>
  )
}

export { WorkflowReadoutContent }
