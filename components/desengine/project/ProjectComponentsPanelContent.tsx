"use client"

import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import { buildProjectComponentSurfaceModel } from "./projectSurface"

const FOCUS_COMPONENT_LABEL = "Сделать фокусом проекта"
const ACTIVE_FOCUS_LABEL = "Текущий фокус проекта"

type ComponentCardProps = {
  activeComponentId: string | null
  component: ProjectComponent
  onCompleteComponent: (componentId: string) => void
  onFocusComponent: (componentId: string) => void
  onReopenComponent: (componentId: string) => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ComponentCard({
  activeComponentId,
  component,
  onCompleteComponent,
  onFocusComponent,
  onReopenComponent,
  workflowReadout,
}: ComponentCardProps) {
  const workflowEntry = workflowReadout.entries.find((entry) => entry.componentId === component.id) ?? null
  const model = buildProjectComponentSurfaceModel(component, {
    workflowEntry,
  })
  const focusActionLabel = workflowEntry?.isFocused ? ACTIVE_FOCUS_LABEL : FOCUS_COMPONENT_LABEL

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
          className="rounded-full bg-black px-4 py-2 text-sm text-white disabled:cursor-default disabled:bg-black/30"
          disabled={activeComponentId === component.id}
          type="button"
          onClick={() => void onFocusComponent(component.id)}
        >
          {activeComponentId === component.id ? ACTIVE_FOCUS_LABEL : focusActionLabel}
        </button>
        <button
          className="rounded-full border border-black px-4 py-2 text-sm"
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
  activeComponentId: string | null
  components: ProjectComponent[]
  onCompleteComponent: (componentId: string) => void
  onFocusComponent: (componentId: string) => void
  onReopenComponent: (componentId: string) => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function ComponentsReadyState({
  activeComponentId,
  components,
  onCompleteComponent,
  onFocusComponent,
  onReopenComponent,
  workflowReadout,
}: ComponentsReadyStateProps) {
  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      {components.map((component) => (
        <ComponentCard
          key={component.id}
          activeComponentId={activeComponentId}
          component={component}
          onCompleteComponent={onCompleteComponent}
          onFocusComponent={onFocusComponent}
          onReopenComponent={onReopenComponent}
          workflowReadout={workflowReadout}
        />
      ))}
    </div>
  )
}

export { ComponentsReadyState }
