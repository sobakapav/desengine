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

function WorkspaceActions({
  activeComponent,
  clearFocus,
  session,
  startProjectWork,
}: {
  activeComponent: ProjectComponent | null
  clearFocus: () => void
  session: ProjectSession | null
  startProjectWork: () => void
}) {
  return (
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
  )
}

function ProjectStatusCard({
  activeComponent,
  completedComponentCount,
  componentCount,
  session,
}: {
  activeComponent: ProjectComponent | null
  completedComponentCount: number
  componentCount: number
  session: ProjectSession | null
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <p className="text-sm uppercase tracking-wide text-black/50">Статус проекта</p>
      <p className="mt-2 text-3xl">{resolveProjectSessionLabel(session)}</p>
      <dl className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Текущий фокус</dt>
          <dd className="mt-1 text-lg">{activeComponent?.title ?? "Фокус ещё не выбран"}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Компоненты проекта</dt>
          <dd className="mt-1 text-lg">{componentCount}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Готово внутри проекта</dt>
          <dd className="mt-1 text-lg">{completedComponentCount}</dd>
        </div>
      </dl>
    </div>
  )
}

function CurrentProjectStepCard({
  activeComponent,
  componentCount,
  workflowReadout,
}: {
  activeComponent: ProjectComponent | null
  componentCount: number
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  return (
    <div className="rounded-3xl border border-black/10 bg-white p-5">
      <h3 className="text-2xl">Текущий шаг</h3>
      <p className="mt-3 text-base text-black/75">{workflowReadout.currentStageTitle}</p>
      <p className="mt-4 text-sm text-black/70">Последняя активность: {workflowReadout.lastActivityLabel}</p>
      <p className="mt-4 text-sm text-black/70">
        {activeComponent
          ? `Проект сейчас работает через компонент «${activeComponent.title}».`
          : componentCount > 0
            ? "У проекта уже есть компоненты, но текущий фокус ещё не выбран."
            : "Сначала добавьте первый компонент ниже, чтобы работа над проектом стала предметной."}
      </p>
    </div>
  )
}

/**
 * @example
 * ```tsx
 * <ProjectWorkspacePanel
 *   activeComponent={null}
 *   clearFocus={() => {}}
 *   completedComponentCount={0}
 *   componentCount={0}
 *   session={null}
 *   startProjectWork={() => {}}
 *   workflowReadout={workflowReadout}
 * />
 * ```
 */
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

        <WorkspaceActions
          activeComponent={activeComponent}
          clearFocus={clearFocus}
          session={session}
          startProjectWork={startProjectWork}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProjectStatusCard
          activeComponent={activeComponent}
          completedComponentCount={completedComponentCount}
          componentCount={componentCount}
          session={session}
        />
        <CurrentProjectStepCard
          activeComponent={activeComponent}
          componentCount={componentCount}
          workflowReadout={workflowReadout}
        />
      </div>

      <p className="mt-5 text-sm text-black/65">
        Подробный workflow и история остаются ниже как поддерживающий слой и не должны перекрывать
        главный путь работы над проектом.
      </p>
    </section>
  )
}

export { ProjectWorkspacePanel }
