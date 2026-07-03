"use client"

import Link from "next/link"

import type { ProjectWorkbenchSession } from "@/lib/project/workbench"

import {
  buildProjectWorkbenchSurfaceModels,
  type ProjectWorkbenchSurfaceModel,
} from "./projectWorkbenchSurface"

function WorkbenchSummary({ count }: { count: number }) {
  return (
    <div className="mt-5 grid gap-3 md:grid-cols-3">
      <article className="shell-card-muted border border-black bg-neutral-50 p-4">
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Materialized верстаки</p>
        <p className="mt-2 text-2xl">{count}</p>
      </article>
      <article className="shell-card-muted border border-black bg-neutral-50 p-4">
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Режим доступа</p>
        <p className="mt-2 text-2xl">Только preview</p>
      </article>
      <article className="shell-card-muted border border-black bg-neutral-50 p-4">
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Назначение</p>
        <p className="mt-2 text-2xl">Проверка связей</p>
      </article>
    </div>
  )
}

function WorkbenchCard({ workbench }: { workbench: ProjectWorkbenchSurfaceModel }) {
  return (
    <article className="shell-card border border-black bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">{workbench.scopeLabel}</p>
          <h3 className="mt-2 text-2xl">{workbench.title}</h3>
        </div>
        <span className="shell-badge inline-flex items-center border border-black bg-white px-3 py-1 text-sm">
          {workbench.accessLabel}
        </span>
      </div>

      <dl className="mt-5 grid gap-3 text-base">
        <div>
          <dt className="text-black/55">Проект</dt>
          <dd>{workbench.projectLabel}</dd>
        </div>
        <div>
          <dt className="text-black/55">Subject</dt>
          <dd>{workbench.subjectLabel}</dd>
        </div>
        <div>
          <dt className="text-black/55">Workflow</dt>
          <dd>{workbench.workflowLabel}</dd>
        </div>
        <div>
          <dt className="text-black/55">Связка с проектом</dt>
          <dd>{workbench.linkageLabel}</dd>
        </div>
        <div>
          <dt className="text-black/55">Статус materialization</dt>
          <dd>{workbench.statusLabel}</dd>
        </div>
        <div>
          <dt className="text-black/55">Последняя активность</dt>
          <dd>{workbench.lastActivityLabel}</dd>
        </div>
      </dl>

      <p className="mt-4 text-base text-black/75">{workbench.summary}</p>

      <p className="shell-callout mt-4 border border-dashed border-black bg-white p-4 text-sm text-black/75">
        {workbench.lockReason}
      </p>

      <ul className="shell-note-list mt-4 text-sm text-black/70">
        {workbench.notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>

      <div className="mt-5">
        <Link
          className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white"
          href={workbench.previewHref}
        >
          Открыть preview верстака
        </Link>
      </div>
    </article>
  )
}

/**
 * @example
 * ```tsx
 * <ProjectWorkbenchPanel
 *   projectId="project-a"
 *   sessions={[]}
 * />
 * ```
 */
function ProjectWorkbenchPanel(args: {
  projectId: string
  sessions: ProjectWorkbenchSession[]
}) {
  const workbenches = buildProjectWorkbenchSurfaceModels(args)

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Workbench layer</p>
          <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">Верстаки проекта</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/72">
            Верстаки уже материализованы как отдельный product layer и связаны с проектом,
            workflow и компонентами. Но это пока только read-only preview: внутрь работы пользователя
            ещё не пускаем.
          </p>
        </div>
      </div>

      <WorkbenchSummary count={workbenches.length} />

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {workbenches.map((workbench) => (
          <WorkbenchCard key={workbench.id} workbench={workbench} />
        ))}
      </div>
    </section>
  )
}

export { ProjectWorkbenchPanel }
