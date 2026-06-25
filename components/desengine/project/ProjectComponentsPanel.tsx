"use client"

import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

import { type ProjectWorkflowTaskCatalogItem } from "./projectComponentWorkflow"
import { ComponentsReadyState } from "./ProjectComponentsPanelContent"
import { useProjectComponents } from "./useProjectComponents"
import { useProjectComponentsPanelController } from "./useProjectComponentsPanelController"

type ProjectComponentsPanelProps = {
  occupiedTaskIds: string[]
  project: ProjectWorkspace
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function buildProjectComponentCounters(components: ReturnType<typeof useProjectComponents>["components"]) {
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
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Всего компонентов</p><p className="mt-2 text-2xl">{counters.total}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Черновики</p><p className="mt-2 text-2xl">{counters.draft}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">В работе</p><p className="mt-2 text-2xl">{counters.inProgress}</p></article>
      <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4"><p className="text-sm uppercase tracking-wide text-black/50">Готовы</p><p className="mt-2 text-2xl">{counters.completed}</p></article>
    </div>
  )
}

function ComponentCreatePanel(args: {
  createState: "idle" | "creating" | "created" | "error"
  lastCreatedComponentId: string | null
  message: string
  onCreate: () => void
  onOpenLastComponent: () => void
  onTitleChange: (value: string) => void
  openState: "idle" | "opening" | "opened" | "error"
  title: string
}) {
  return (
    <div className="mt-5 rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
      <h3 className="text-2xl">Создать новый компонент</h3>
      <p className="mt-2 text-base text-black/70">
        Создание компонента только добавляет новую рабочую часть в проект. Сама работа начнётся
        позже, когда вы нажмёте `Работать над компонентом`.
      </p>
      <div className="mt-4 flex flex-col gap-3 md:flex-row">
        <input
          className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base"
          placeholder="Например, Product card"
          value={args.title}
          onChange={(event) => args.onTitleChange(event.target.value)}
        />
        <button
          className="rounded-full bg-black px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-black/40"
          disabled={args.createState === "creating"}
          type="button"
          onClick={() => void args.onCreate()}
        >
          {args.createState === "creating" ? "Создаём…" : "Создать компонент"}
        </button>
      </div>
      {args.message ? (
        <p className={`mt-4 rounded-2xl border p-4 text-sm ${args.createState === "error" || args.openState === "error" ? "border-red-300 bg-red-50 text-red-900" : "border-black/10 bg-white text-black/80"}`}>
          {args.message}
        </p>
      ) : null}
      {args.createState === "created" && args.lastCreatedComponentId ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button className="rounded-full bg-black px-4 py-2 text-sm text-white" type="button" onClick={() => void args.onOpenLastComponent()}>
            Работать над новым компонентом
          </button>
          <span className="self-center text-sm text-black/65">Или оставьте компонент в списке и создайте следующий.</span>
        </div>
      ) : null}
    </div>
  )
}

function ComponentRegistryState(args: {
  activeComponentId: string | null
  components: ReturnType<typeof useProjectComponents>["components"]
  onOpenWorkflow: (componentId: string) => void
  openState: "idle" | "opening" | "opened" | "error"
  stateStatus: ReturnType<typeof useProjectComponents>["status"]
  workflowReadout: ProjectWorkflowReadoutSnapshot
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
}) {
  if (args.stateStatus === "loading") {
    return <p className="mt-4 text-lg text-black/70">Загружаем project-scoped registry компонентов...</p>
  }

  if (args.stateStatus === "error") {
    return (
      <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-lg text-red-900">
        Не удалось прочитать registry компонентов этого проекта.
      </p>
    )
  }

  if (args.components.length === 0) {
    return (
      <p className="mt-4 text-lg text-black/70">
        В этом проекте ещё нет компонентов. Создайте первый компонент, чтобы перейти от проекта
        к реальной работе.
      </p>
    )
  }

  return (
    <ComponentsReadyState
      activeComponentId={args.activeComponentId}
      components={args.components}
      openState={args.openState}
      onOpenWorkflow={args.onOpenWorkflow}
      workflowReadout={args.workflowReadout}
      workflowTaskCatalog={args.workflowTaskCatalog}
    />
  )
}

function ProjectComponentsPanel({
  occupiedTaskIds,
  project,
  workflowTaskCatalog,
  workflowReadout,
}: ProjectComponentsPanelProps) {
  const controller = useProjectComponentsPanelController({
    occupiedTaskIds,
    project,
    workflowReadout,
    workflowTaskCatalog,
  })
  const { state } = controller
  const counters = buildProjectComponentCounters(state.components)

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">Компоненты проекта</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Компоненты помогают разложить проект на отдельные рабочие части. Для каждой такой части
            можно открыть свою работу и потом вернуться к ней из этого же проекта.
          </p>
        </div>
      </div>

      <ComponentCounters counters={counters} />
      <ComponentCreatePanel
        createState={controller.createState}
        lastCreatedComponentId={controller.lastCreatedComponentId}
        message={controller.message}
        onCreate={() => void controller.handleCreate()}
        onOpenLastComponent={() => controller.lastCreatedComponentId ? void controller.handleOpenWorkflow(controller.lastCreatedComponentId) : undefined}
        onTitleChange={controller.handleTitleChange}
        openState={controller.openState}
        title={controller.title}
      />
      <ComponentRegistryState
        activeComponentId={controller.activeComponentId}
        components={state.components}
        onOpenWorkflow={(componentId) => void controller.handleOpenWorkflow(componentId)}
        openState={controller.openState}
        stateStatus={state.status}
        workflowReadout={workflowReadout}
        workflowTaskCatalog={workflowTaskCatalog}
      />
    </section>
  )
}

export { ProjectComponentsPanel }
