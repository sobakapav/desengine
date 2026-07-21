"use client"

import type { ReactNode } from "react"

import type { ProjectSurfaceSummary } from "@/lib/project/client"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { Project } from "@/lib/project/runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

import { ProjectConfigPanel } from "./ProjectConfigPanel"
import { ProjectHistoryDiagnosticsPanel } from "./ProjectHistoryDiagnosticsPanel"
import { ProjectSourcesPanel } from "./ProjectSourcesPanel"
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
    <details className="shell-section border border-black bg-white">
      <summary className="cursor-pointer list-none px-6 py-5 text-lg font-medium marker:content-none">
        {summary}
      </summary>
      <div className="shell-divider px-1 pb-1">{children}</div>
    </details>
  )
}

function ProjectOverviewMetadata({
  model,
}: {
  model: Pick<
    ReturnType<typeof buildProjectSurfaceModel>,
    "id" | "code" | "isActive" | "uiKitTitle" | "storageLabel" | "rootPathLabel" | "createdAtLabel" | "updatedAtLabel"
  >
}) {
  return (
    <section className="shell-card border border-black bg-white p-5">
      <dl className="grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Идентификатор проекта</dt>
          <dd className="mt-1 text-lg">{model.id}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Код проекта</dt>
          <dd className="mt-1 text-lg"><code>{model.code}</code></dd>
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
        <div className="md:col-span-2">
          <dt className="text-sm uppercase tracking-wide text-black/50">Server path</dt>
          <dd className="mt-1 font-mono text-sm">{model.rootPathLabel}</dd>
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
  projectSurface,
  rootPath,
  workflowReadout,
}: {
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  isActive: boolean
  onProjectSaved: (
    project: Project,
    options?: {
      rootPath?: string | null
      surface?: ProjectSurfaceSummary | null
    },
  ) => void
  project: Project
  projectSurface: ProjectSurfaceSummary | null
  rootPath: string | null
  workflowReadout: ProjectWorkflowReadoutSnapshot
}) {
  const projectModel = buildProjectSurfaceModel(project, isActive, rootPath, projectSurface)

  return (
    <section className="mt-6 space-y-4">
      <div>
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Поддерживающий слой</p>
        <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">Поддерживающий слой проекта</h2>
        <p className="mt-2 max-w-4xl text-lg text-black/72">
          Здесь остаются настройка, история и подробное чтение workflow. Главный путь работы выше:
          проект, компоненты и активные линии работы.
        </p>
      </div>

      <SupportPanelSection summary="Как проект держит рабочий контур">
        <ProjectWorkflowReadoutPanel workflowReadout={workflowReadout} />
      </SupportPanelSection>

      <SupportPanelSection summary="История проектной работы">
        <ProjectHistoryDiagnosticsPanel historyDiagnostics={historyDiagnostics} />
      </SupportPanelSection>

      <SupportPanelSection summary="Настройка проекта">
        <ProjectConfigPanel
          project={project}
          projectSurface={projectSurface}
          onProjectSaved={onProjectSaved}
          rootPath={rootPath}
        />
      </SupportPanelSection>

      <SupportPanelSection summary="Метаданные и источники проекта">
        <ProjectSourcesPanel surface={projectSurface} />
      </SupportPanelSection>

      <SupportPanelSection summary="Паспорт проекта">
        <ProjectOverviewMetadata model={projectModel} />
      </SupportPanelSection>
    </section>
  )
}

export { ProjectOverviewSupportPanels }
