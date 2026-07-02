"use client"

import { buildProjectWorkflowReadoutModel } from "./projectSurface"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

type WorkflowReadoutContentProps = {
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function WorkflowReadoutSummary({ model }: { model: ReturnType<typeof buildProjectWorkflowReadoutModel> }) {
  return (
    <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Компоненты</p><p className="mt-2 text-2xl">{model.summary.componentCountLabel}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Фокусы</p><p className="mt-2 text-2xl">{model.summary.focusedCountLabel}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Готово</p><p className="mt-2 text-2xl">{model.summary.completedCountLabel}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Шаги workflow</p><p className="mt-2 text-2xl">{model.summary.stageCountLabel}</p></article>
    </div>
  )
}

function WorkflowReadoutCard({ entry }: { entry: ReturnType<typeof buildProjectWorkflowReadoutModel>["entries"][number] }) {
  return (
    <article className="rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-2xl">{entry.componentTitle}</h3>
          <p className="mt-1 text-sm text-black/60">{entry.componentId}</p>
        </div>
        <span className="rounded-full border border-black/15 bg-white px-3 py-1 text-sm text-black/70">{entry.componentStatusLabel}</span>
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Положение в проекте</p>
          <p className="mt-2 text-lg">{entry.focusLabel}</p>
          <p className="mt-2 text-sm text-black/70">Последняя активность: {entry.lastActivityLabel}</p>
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Шаг workflow</p>
          <p className="mt-2 text-lg">{entry.stageTitle}</p>
          <p className="mt-2 text-sm text-black/70">{entry.stageStatusLabel}</p>
        </div>
      </div>
      <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Что это значит для пользователя</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {entry.noteLabels.map((label) => (
            <span key={label} className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-sm text-black/75">{label}</span>
          ))}
        </div>
      </div>
    </article>
  )
}

function WorkflowReadoutEntries({ model }: { model: ReturnType<typeof buildProjectWorkflowReadoutModel> }) {
  return (
    <div className="mt-6 grid gap-4 xl:grid-cols-2">
      {model.entries.map((entry) => <WorkflowReadoutCard key={entry.componentId} entry={entry} />)}
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
          У проекта пока нет предметной работы. Как только вы добавите компоненты и выберете
          текущий фокус, здесь появится живая картина project-workflow.
        </p>
      ) : (
        <WorkflowReadoutEntries model={model} />
      )}
    </>
  )
}

export { WorkflowReadoutContent }
