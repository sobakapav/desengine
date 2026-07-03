"use client"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

import { buildProjectComponentSurfaceModel } from "./projectSurface"

const START_COMPONENT_WORK_LABEL = "Взять в работу"
const COMPONENT_IN_PROGRESS_LABEL = "Компонент уже в работе"

type ComponentCardProps = {
  component: ProjectComponent
  onCompleteComponent: (componentId: string) => void
  onReopenComponent: (componentId: string) => void
  onStartComponentWork: (componentId: string) => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ComponentCard({
  component,
  onCompleteComponent,
  onReopenComponent,
  onStartComponentWork,
  workflowReadout,
}: ComponentCardProps) {
  const workflowEntry = workflowReadout.entries.find((entry) => entry.componentId === component.id) ?? null
  const model = buildProjectComponentSurfaceModel(component, {
    workflowEntry,
  })
  const sessionActionLabel = component.status === "in_progress"
    ? COMPONENT_IN_PROGRESS_LABEL
    : component.status === "draft"
      ? START_COMPONENT_WORK_LABEL
      : model.sessionActionLabel

  return (
    <article className="shell-card-muted">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-2xl">{model.title}</h3>
        <span className="shell-badge">
          {model.statusLabel}
        </span>
      </div>
      <p className="mt-2 text-sm text-black/60">
        <code>{model.id}</code>
      </p>
      <dl className="mt-4 grid gap-2 text-base">
        <div><dt className="text-black/60">Роль в project-workflow</dt><dd>{model.workflowLabel}</dd></div>
        <div><dt className="text-black/60">Положение в проектной работе</dt><dd>{model.sessionStatusLabel}</dd></div>
        <div><dt className="text-black/60">Текущий контекст</dt><dd>{model.workflowProgressLabel}</dd></div>
        <div><dt className="text-black/60">Что делает проект</dt><dd>{model.activeWorkflowPointLabel}</dd></div>
        <div><dt className="text-black/60">Последняя активность</dt><dd>{model.lastActivityLabel}</dd></div>
        <div><dt className="text-black/60">Создан</dt><dd>{model.createdAtLabel}</dd></div>
        <div><dt className="text-black/60">Обновлён</dt><dd>{model.updatedAtLabel}</dd></div>
      </dl>
      <div className="mt-4 flex flex-wrap gap-3">
        <button
          className="shell-button disabled:cursor-default disabled:opacity-45"
          disabled={component.status === "in_progress"}
          type="button"
          onClick={() => void onStartComponentWork(component.id)}
        >
          {sessionActionLabel}
        </button>
        <button
          className="shell-button-secondary"
          type="button"
          onClick={() => void (component.status === "completed"
            ? onReopenComponent(component.id)
            : onCompleteComponent(component.id))}
        >
          {model.completeActionLabel}
        </button>
      </div>
    </article>
  )
}

type ComponentsReadyStateProps = {
  components: ProjectComponent[]
  onCompleteComponent: (componentId: string) => void
  onReopenComponent: (componentId: string) => void
  onStartComponentWork: (componentId: string) => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ComponentsReadyState({
  components,
  onCompleteComponent,
  onReopenComponent,
  onStartComponentWork,
  workflowReadout,
}: ComponentsReadyStateProps) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {components.map((component) => (
        <ComponentCard
          key={component.id}
          component={component}
          onCompleteComponent={onCompleteComponent}
          onReopenComponent={onReopenComponent}
          onStartComponentWork={onStartComponentWork}
          workflowReadout={workflowReadout}
        />
      ))}
    </div>
  )
}

export { ComponentsReadyState }
