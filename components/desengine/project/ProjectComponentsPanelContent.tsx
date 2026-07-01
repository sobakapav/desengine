"use client"

import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import { buildProjectComponentSurfaceModel } from "./projectSurface"

const START_COMPONENT_WORK_LABEL = "Работать над компонентом"
const RESUME_COMPONENT_WORK_LABEL = "Продолжить работу"

type ComponentCardProps = {
  activeComponentId: string | null
  component: ProjectComponent
  openState: "idle" | "opening" | "opened" | "error"
  onOpenWorkflow: (componentId: string) => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ComponentCard({
  activeComponentId,
  component,
  openState,
  onOpenWorkflow,
  workflowReadout,
}: ComponentCardProps) {
  const workflowEntry = workflowReadout.entries.find((entry) => entry.componentId === component.id) ?? null
  const model = buildProjectComponentSurfaceModel(component, {
    workflowEntry,
  })
  const sessionActionLabel = model.sessionActionLabel === RESUME_COMPONENT_WORK_LABEL
    ? RESUME_COMPONENT_WORK_LABEL
    : START_COMPONENT_WORK_LABEL

  return (
    <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl">{model.title}</h3>
        <span className="rounded-full border border-black/10 px-3 py-1 text-sm">
          {model.statusLabel}
        </span>
      </div>
      <p className="mt-2 text-sm text-black/60">
        <code>{model.id}</code>
      </p>
      <dl className="mt-4 grid gap-2 text-base">
        <div><dt className="text-black/60">Тип работы</dt><dd>{model.workflowLabel}</dd></div>
        <div><dt className="text-black/60">Состояние работы</dt><dd>{model.sessionStatusLabel}</dd></div>
        <div><dt className="text-black/60">Последняя активность</dt><dd>{model.lastActivityLabel}</dd></div>
        <div><dt className="text-black/60">Прогресс работы</dt><dd>{model.workflowProgressLabel}</dd></div>
        <div><dt className="text-black/60">Текущий шаг</dt><dd>{model.activeWorkflowPointLabel}</dd></div>
        <div><dt className="text-black/60">Создан</dt><dd>{model.createdAtLabel}</dd></div>
        <div><dt className="text-black/60">Обновлён</dt><dd>{model.updatedAtLabel}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="rounded-full bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-black/40"
          disabled={openState === "opening" && activeComponentId === component.id}
          type="button"
          onClick={() => void onOpenWorkflow(component.id)}
        >
          {openState === "opening" && activeComponentId === component.id ? "Открываем…" : sessionActionLabel}
        </button>
      </div>
    </article>
  )
}

type ComponentsReadyStateProps = {
  activeComponentId: string | null
  components: ProjectComponent[]
  openState: "idle" | "opening" | "opened" | "error"
  onOpenWorkflow: (componentId: string) => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ComponentsReadyState({
  activeComponentId,
  components,
  openState,
  onOpenWorkflow,
  workflowReadout,
}: ComponentsReadyStateProps) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {components.map((component) => (
        <ComponentCard
          key={component.id}
          activeComponentId={activeComponentId}
          component={component}
          openState={openState}
          onOpenWorkflow={onOpenWorkflow}
          workflowReadout={workflowReadout}
        />
      ))}
    </div>
  )
}

export { ComponentsReadyState }
