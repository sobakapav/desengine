"use client"

import Link from "next/link"

import { getProjectUrl } from "@/lib/project/navigation"

import { buildProjectWorkbenchSurfaceModel } from "./projectWorkbenchSurface"
import { useProjectOverview } from "./useProjectOverview"
import { useProjectWorkspace } from "./useProjectWorkspace"

type ProjectWorkbenchScreenProps = {
  projectId: string
  sessionId: string
}

function ProjectWorkbenchLoadingState() {
  return (
    <main className="shell-page">
      <p className="shell-eyebrow">Workbench</p>
      <h1 className="shell-title py-2">Верстак</h1>
      <p className="text-xl">Загружаем привязки project-aware верстака...</p>
    </main>
  )
}

function ProjectWorkbenchErrorState() {
  return (
    <main className="shell-page">
      <p className="shell-eyebrow">Workbench</p>
      <h1 className="shell-title py-2">Верстак</h1>
      <p className="shell-callout text-lg">
        Не удалось прочитать состояние верстака из текущего проекта.
      </p>
    </main>
  )
}

function ProjectWorkbenchMissingState({ projectId }: { projectId: string }) {
  return (
    <main className="shell-page">
      <p className="shell-eyebrow">Workbench</p>
      <h1 className="shell-title py-2">Верстак не найден</h1>
      <p className="max-w-3xl text-xl text-black/70">
        Этот workbench-session не найден среди материализованных верстаков проекта.
      </p>
      <Link className="shell-button-secondary mt-6" href={getProjectUrl(projectId)}>
        Вернуться к проекту
      </Link>
    </main>
  )
}

/**
 * @example
 * ```tsx
 * <ProjectWorkbenchScreen projectId="project-a" sessionId="project-a--project--project-a" />
 * ```
 */
function ProjectWorkbenchScreen({ projectId, sessionId }: ProjectWorkbenchScreenProps) {
  const overview = useProjectOverview(projectId)
  const workspace = useProjectWorkspace(overview.project)

  if (overview.status === "loading") {
    return <ProjectWorkbenchLoadingState />
  }

  if (overview.status === "error") {
    return <ProjectWorkbenchErrorState />
  }

  if (overview.status === "missing" || !overview.project) {
    return <ProjectWorkbenchMissingState projectId={projectId} />
  }

  if (workspace.status === "loading") {
    return <ProjectWorkbenchLoadingState />
  }

  if (workspace.status === "error") {
    return <ProjectWorkbenchErrorState />
  }

  const workbenchSession = workspace.workbenches.find((session) => session.id === sessionId) ?? null
  if (!workbenchSession) {
    return <ProjectWorkbenchMissingState projectId={projectId} />
  }

  const model = buildProjectWorkbenchSurfaceModel(projectId, workbenchSession)

  return (
    <main className="shell-page">
      <p className="shell-eyebrow">Workbench</p>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="shell-title py-2">{model.title}</h1>
        <span className="shell-badge">{model.statusLabel}</span>
      </div>

      <p className="shell-lead shell-prose-muted">
        Верстак уже существует как сущность проекта, но пока открыт только в режиме наблюдения.
        Это нужно, чтобы прощупать каркас и его привязки до допуска к реальной работе.
      </p>

      <section className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <article className="shell-section">
          <p className="shell-eyebrow">Связки</p>
          <dl className="mt-4 grid gap-4">
            <div>
              <dt className="text-sm uppercase tracking-wide text-black/50">Проект</dt>
              <dd className="mt-1 text-2xl">{model.projectLabel}</dd>
            </div>
            <div>
              <dt className="text-sm uppercase tracking-wide text-black/50">Предмет работы</dt>
              <dd className="mt-1 text-2xl">{model.subjectLabel}</dd>
            </div>
            <div>
              <dt className="text-sm uppercase tracking-wide text-black/50">Workflow</dt>
              <dd className="mt-1 text-2xl">{model.workflowLabel}</dd>
            </div>
            <div>
              <dt className="text-sm uppercase tracking-wide text-black/50">Роль в контуре</dt>
              <dd className="mt-1 text-2xl">{model.linkageLabel}</dd>
            </div>
          </dl>
        </article>

        <article className="shell-section-muted">
          <p className="shell-eyebrow">Locked mode</p>
          <h2 className="shell-subtitle mt-2">Работа пока не открыта</h2>
          <p className="mt-3 text-base">{model.lockReason}</p>
          <p className="mt-4 text-sm shell-prose-muted">
            Последняя активность в связанном контуре: {model.lastActivityLabel}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="shell-button" href={getProjectUrl(projectId)}>
              Вернуться к проекту
            </Link>
            <span className="shell-badge">
              Следующий этап: открыть действия внутри верстака позже
            </span>
          </div>
        </article>
      </section>
    </main>
  )
}

export { ProjectWorkbenchScreen }
