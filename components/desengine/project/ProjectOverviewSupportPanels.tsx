"use client"

import type { ReactNode } from "react"

import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { Project } from "@/lib/project/runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

import { ProjectConfigPanel } from "./ProjectConfigPanel"
import { ProjectHistoryDiagnosticsPanel } from "./ProjectHistoryDiagnosticsPanel"
import { ProjectWorkflowReadoutPanel } from "./ProjectWorkflowReadoutPanel"
import { buildProjectSurfaceModel } from "./projectSurface"

function SupportPanelSection({
  children,
  summary,
}: {
  children: ReactNode
  summary: string
}) {
  return (
    <details className="rounded-3xl border border-black/10 bg-white">
      <summary className="cursor-pointer list-none px-6 py-5 text-lg font-medium marker:content-none">
        {summary}
      </summary>
      <div className="border-t border-black/10 px-1 pb-1">{children}</div>
    </details>
  )
}

function ProjectOverviewMetadata({
  model,
}: {
  model: Pick<
    ReturnType<typeof buildProjectSurfaceModel>,
    "id" | "isActive" | "uiKitTitle" | "storageLabel" | "createdAtLabel" | "updatedAtLabel"
  >
}) {
  return (
    <section className="rounded-3xl bg-white p-5">
      <dl className="grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Идентификатор проекта</dt>
          <dd className="mt-1 text-lg">{model.id}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Статус</dt>
          <dd className="mt-1 text-lg">{model.isActive ? "Активный проект" : "Неактивный проект"}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">UI kit</dt>
          <dd className="mt-1 text-lg">{model.uiKitTitle}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Хранение</dt>
          <dd className="mt-1 text-lg">{model.storageLabel}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Создан</dt>
          <dd className="mt-1 text-lg">{model.createdAtLabel}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Обновлён</dt>
          <dd className="mt-1 text-lg">{model.updatedAtLabel}</dd>
        </div>
      </dl>
    </section>
  )
}

/**
 * @example
 * ```tsx
 * <ProjectOverviewSupportPanels
 *   historyDiagnostics={historyDiagnostics}
 *   isActive
 *   project={project}
 *   onProjectSaved={replaceProject}
 *   workflowReadout={workflowReadout}
 * />
 * ```
 */
function ProjectOverviewSupportPanels({
  historyDiagnostics,
  isActive,
  onProjectSaved,
  project,
  workflowReadout,
}: {
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  isActive: boolean
  onProjectSaved: (project: Project) => void
  project: Project
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  const projectModel = buildProjectSurfaceModel(project, isActive)

  return (
    <section className="mt-6 space-y-4">
      <div>
        <h2 className="text-3xl">Поддерживающий слой проекта</h2>
        <p className="mt-2 max-w-4xl text-lg text-black/70">
          Здесь остаются настройка, история и подробное чтение workflow. Главный путь работы выше:
          проект, компоненты и текущий фокус.
        </p>
      </div>

      <SupportPanelSection summary="Как проект держит рабочий контур">
        <ProjectWorkflowReadoutPanel workflowReadout={workflowReadout} />
      </SupportPanelSection>

      <SupportPanelSection summary="История проектной работы">
        <ProjectHistoryDiagnosticsPanel historyDiagnostics={historyDiagnostics} />
      </SupportPanelSection>

      <SupportPanelSection summary="Настройка проекта">
        <ProjectConfigPanel project={project} onProjectSaved={onProjectSaved} />
      </SupportPanelSection>

      <SupportPanelSection summary="Паспорт проекта">
        <ProjectOverviewMetadata model={projectModel} />
      </SupportPanelSection>
    </section>
  )
}

export { ProjectOverviewSupportPanels }
