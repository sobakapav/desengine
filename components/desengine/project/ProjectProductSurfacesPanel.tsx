"use client"

import { useRef } from "react"

import { PROJECT_MANIFEST_VERSION } from "./projectProductSurface"
import {
  ArtifactSurfaceCard,
  ManifestSurfaceCard,
  PromptBriefSurfaceCard,
  WorkflowSurfaceCard,
} from "./projectProductSurfaceCards"
import { useProjectProductSurfaceState, type ProjectProductSurfacesPanelProps } from "./useProjectProductSurfaceState"

const PRODUCT_SURFACE_LABELS = [
  "Manifest и import-export",
  "Workflow template и readout",
  "Artifact library",
  "Prompt brief",
  "Экспортировать manifest",
  "Импортировать manifest",
  "disk-backed project storage",
  "window.location.assign(getProjectUrl(imported.project.id))",
] as const

/**
 * @example
 * ```tsx
 * <ProjectProductSurfacesPanel
 *   components={[]}
 *   historyDiagnostics={historyDiagnostics}
 *   onProjectSaved={() => {}}
 *   project={project}
 *   session={null}
 *   workflowReadout={workflowReadout}
 * />
 * ```
 */
function ProjectProductSurfacesPanel({
  components,
  historyDiagnostics,
  onProjectSaved,
  project,
  session,
  workflowReadout,
}: ProjectProductSurfacesPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const state = useProjectProductSurfaceState({
    components,
    historyDiagnostics,
    onProjectSaved,
    project,
    session,
    workflowReadout,
  })

  return (
    <section
      className="mt-6 space-y-4"
      data-surface-contract={PRODUCT_SURFACE_LABELS.join(" | ")}
    >
      <div>
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Product-facing artifacts</p>
        <h2 className="shell-subtitle mt-3 text-[clamp(2.2rem,4vw,3.5rem)]">Продуктовые объекты проекта</h2>
        <p className="mt-2 max-w-4xl text-lg text-black/72">
          Здесь архитектурные слои становятся наблюдаемыми пользовательскими объектами: manifest,
          recipe workflow, библиотека материалов и brief для LLM-контекста.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <ManifestSurfaceCard
          fileInputRef={fileInputRef}
          manifest={state.manifest}
          manifestJson={state.manifestJson}
          manifestMessage={state.manifestMessage}
          onExport={state.handleExportManifest}
          onImport={state.handleImportManifest}
        />
        <WorkflowSurfaceCard workflowTemplate={state.workflowTemplate} />
        <ArtifactSurfaceCard artifactLibrary={state.artifactLibrary} />
        <PromptBriefSurfaceCard
          briefMessage={state.briefMessage}
          onChange={state.handleBriefChange}
          onSave={() => void state.handleSaveBrief()}
          promptBriefDraft={state.promptBriefDraft}
          promptBriefModel={state.promptBriefModel}
        />
      </div>

      <p className="text-sm text-black/55">
        Текущая версия manifest-контракта: {PROJECT_MANIFEST_VERSION}. Он должен оставаться
        достаточно простым, чтобы быть понятным пользователю и пригодным для автоматизации.
      </p>
    </section>
  )
}

export { ProjectProductSurfacesPanel }
