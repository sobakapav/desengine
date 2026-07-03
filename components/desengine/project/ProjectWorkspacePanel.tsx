"use client"

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
  session,
  startProjectWork,
}: {
  session: ProjectSession | null
  startProjectWork: () => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white"
        type="button"
        onClick={() => void startProjectWork()}
      >
        {session?.status === "idle" ? "Начать работу над проектом" : "Продолжить работу над проектом"}
      </button>
    </div>
  )
}

function ProjectStatusCard({
  completedComponentCount,
  componentCount,
  inProgressComponentCount,
  session,
}: {
  completedComponentCount: number
  componentCount: number
  inProgressComponentCount: number
  session: ProjectSession | null
}) {
  return (
    <div className="shell-card border border-black bg-white p-5">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Статус проекта</p>
      <p className="mt-2 text-3xl">{resolveProjectSessionLabel(session)}</p>
      <dl className="mt-5 grid gap-4 md:grid-cols-3">
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Линии в работе</dt>
          <dd className="mt-1 text-lg">{inProgressComponentCount}</dd>
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
  componentCount,
  inProgressComponentCount,
  workflowReadout,
}: {
  componentCount: number
  inProgressComponentCount: number
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  return (
    <div className="shell-card border border-black bg-white p-5">
      <h3 className="text-2xl">Текущий шаг</h3>
      <p className="mt-3 text-base text-black/75">{workflowReadout.currentStageTitle}</p>
      <p className="mt-4 text-sm text-black/70">Последняя активность: {workflowReadout.lastActivityLabel}</p>
      <p className="mt-4 text-sm text-black/70">
        {inProgressComponentCount > 0
          ? `Сейчас у проекта ${inProgressComponentCount} активн${inProgressComponentCount === 1 ? "ая линия" : "ых линий"} работы по компонентам.`
          : componentCount > 0
            ? "У проекта уже есть компоненты, но активные линии работы по ним ещё не запущены."
            : "Сначала добавьте первый компонент ниже, чтобы работа над проектом стала предметной."}
      </p>
    </div>
  )
}

/**
 * @example
 * ```tsx
 * <ProjectWorkspacePanel
 *   completedComponentCount={0}
 *   componentCount={0}
 *   inProgressComponentCount={0}
 *   session={null}
 *   startProjectWork={() => {}}
 *   workflowReadout={workflowReadout}
 * />
 * ```
 */
function ProjectWorkspacePanel({
  completedComponentCount,
  componentCount,
  inProgressComponentCount,
  session,
  startProjectWork,
  workflowReadout,
}: {
  completedComponentCount: number
  componentCount: number
  inProgressComponentCount: number
  session: ProjectSession | null
  startProjectWork: () => void
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project session</p>
          <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">Работа над проектом</h2>
          <p className="mt-3 max-w-4xl text-lg text-black/72">
            Проект здесь является единственной рабочей сущностью. Компоненты входят в проектную
            работу как параллельные линии, а не как отдельные изолированные задачи.
          </p>
        </div>

        <WorkspaceActions
          session={session}
          startProjectWork={startProjectWork}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProjectStatusCard
          completedComponentCount={completedComponentCount}
          componentCount={componentCount}
          inProgressComponentCount={inProgressComponentCount}
          session={session}
        />
        <CurrentProjectStepCard
          componentCount={componentCount}
          inProgressComponentCount={inProgressComponentCount}
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
