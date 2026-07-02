"use client"

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react"

import { buildProjectManifestFileName, serializeProjectManifest, type ProjectManifest } from "@/lib/project/manifest"
import { getProjectUrl } from "@/lib/project/navigation"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import { createBrowserProjectStorage } from "@/lib/project/storage"
import type { ProjectSession } from "@/lib/project/workspace-session"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"

import {
  PROJECT_MANIFEST_VERSION,
  buildProjectArtifactLibraryModel,
  buildProjectManifestDocument,
  buildProjectPromptBriefModel,
  buildProjectWorkflowTemplateModel,
  parseProjectManifestDocument,
  readProjectPromptBrief,
} from "./projectProductSurface"
import type { ProjectComponent } from "@/lib/project/component-runtime"

type ProjectProductSurfacesPanelProps = {
  components: ProjectComponent[]
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  onProjectSaved: (project: ProjectWorkspace) => void
  project: ProjectWorkspace
  session: ProjectSession | null
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

type ProjectProductSurfaceState = {
  artifactLibrary: ReturnType<typeof buildProjectArtifactLibraryModel>
  briefMessage: string
  handleBriefChange: (value: string) => void
  handleExportManifest: () => void
  handleImportManifest: (event: ChangeEvent<HTMLInputElement>) => void
  handleSaveBrief: () => Promise<void>
  manifest: ProjectManifest
  manifestJson: string
  manifestMessage: string
  promptBriefDraft: string
  promptBriefModel: ReturnType<typeof buildProjectPromptBriefModel>
  workflowTemplate: ReturnType<typeof buildProjectWorkflowTemplateModel>
}

function SurfaceCard({
  children,
  description,
  title,
}: {
  children: ReactNode
  description: string
  title: string
}) {
  return (
    <article className="rounded-3xl border border-black/10 bg-white p-5 shadow-sm">
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 text-base text-black/70">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  )
}

function ManifestPreview({ manifestJson }: { manifestJson: string }) {
  return (
    <pre className="max-h-96 overflow-auto rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-xs leading-6 text-black/80">
      {manifestJson}
    </pre>
  )
}

function buildProjectWithPromptBrief(project: ProjectWorkspace, promptBrief: string) {
  return {
    ...project,
    settings: {
      ...project.settings,
      promptBrief: promptBrief.trim(),
    },
  } satisfies ProjectWorkspace
}

function downloadManifest(manifest: ProjectManifest) {
  const blob = new Blob([serializeProjectManifest(manifest)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = buildProjectManifestFileName(manifest.project)
  link.click()
  URL.revokeObjectURL(url)
}

async function persistPromptBrief(args: {
  onProjectSaved: (project: ProjectWorkspace) => void
  project: ProjectWorkspace
  promptBriefDraft: string
}) {
  const storage = createBrowserProjectStorage({ storage: window.localStorage })
  const nextProject = buildProjectWithPromptBrief(args.project, args.promptBriefDraft)
  await storage.saveProject(nextProject)
  args.onProjectSaved(nextProject)
}

async function importManifestFile(args: {
  event: ChangeEvent<HTMLInputElement>
  setManifestMessage: (value: string) => void
}) {
  const file = args.event.target.files?.[0]
  if (!file) {
    return
  }

  const parsedManifest = parseProjectManifestDocument(await file.text())
  if (!parsedManifest.ok) {
    args.setManifestMessage(parsedManifest.message)
    args.event.target.value = ""
    return
  }

  const storage = createBrowserProjectStorage({ storage: window.localStorage })
  const imported = await storage.importProjectManifest(parsedManifest.manifest)
  args.setManifestMessage(
    "Manifest импортирован в локальный реестр проекта. Открываю проект через новый canonical contract.",
  )
  args.event.target.value = ""
  window.location.assign(getProjectUrl(imported.project.id))
}

function buildProjectProductSurfaceModels(args: ProjectProductSurfacesPanelProps, promptBriefDraft: string) {
  const workflowTemplate = buildProjectWorkflowTemplateModel({
    workflowReadout: args.workflowReadout,
    componentCount: args.components.length,
  })
  const artifactLibrary = buildProjectArtifactLibraryModel({
    components: args.components,
    historyDiagnostics: args.historyDiagnostics,
    promptBrief: promptBriefDraft,
    project: args.project,
    workflowReadout: args.workflowReadout,
  })
  const promptBriefModel = buildProjectPromptBriefModel({
    components: args.components,
    project: args.project,
    promptBrief: promptBriefDraft,
    workflowReadout: args.workflowReadout,
  })
  const manifest = buildProjectManifestDocument({
    components: args.components,
    historyDiagnostics: args.historyDiagnostics,
    project: args.project,
    promptBrief: promptBriefDraft,
    session: args.session,
    workflowReadout: args.workflowReadout,
  })

  return {
    artifactLibrary,
    manifest,
    manifestJson: serializeProjectManifest(manifest),
    promptBriefModel,
    workflowTemplate,
  }
}

function useProjectProductSurfaceState(args: ProjectProductSurfacesPanelProps): ProjectProductSurfaceState {
  const [promptBriefDraft, setPromptBriefDraft] = useState("")
  const [briefMessage, setBriefMessage] = useState("")
  const [manifestMessage, setManifestMessage] = useState("")

  useEffect(() => {
    setPromptBriefDraft(readProjectPromptBrief({
      project: args.project,
      components: args.components,
      workflowReadout: args.workflowReadout,
    }))
    setBriefMessage("")
    setManifestMessage("")
  }, [args.components, args.project, args.workflowReadout])

  const models = useMemo(() => buildProjectProductSurfaceModels(args, promptBriefDraft), [args, promptBriefDraft])

  function handleBriefChange(value: string) {
    setPromptBriefDraft(value)
    setBriefMessage("")
  }

  function handleExportManifest() {
    downloadManifest(models.manifest)
    setManifestMessage("Manifest выгружен как project-owned контракт.")
  }

  async function handleSaveBrief() {
    await persistPromptBrief({
      onProjectSaved: args.onProjectSaved,
      project: args.project,
      promptBriefDraft,
    })
    setBriefMessage("Prompt brief сохранён в canonical project settings и войдёт в manifest.")
  }

  function handleImportManifest(event: ChangeEvent<HTMLInputElement>) {
    void importManifestFile({ event, setManifestMessage })
  }

  return {
    artifactLibrary: models.artifactLibrary,
    briefMessage,
    handleBriefChange,
    handleExportManifest,
    handleImportManifest,
    handleSaveBrief,
    manifest: models.manifest,
    manifestJson: models.manifestJson,
    manifestMessage,
    promptBriefDraft,
    promptBriefModel: models.promptBriefModel,
    workflowTemplate: models.workflowTemplate,
  }
}

function ManifestSurfaceCard(args: {
  fileInputRef: React.RefObject<HTMLInputElement | null>
  manifest: ProjectManifest
  manifestJson: string
  manifestMessage: string
  onExport: () => void
  onImport: (event: ChangeEvent<HTMLInputElement>) => void
}) {
  return (
    <SurfaceCard
      description="Manifest делает проект переносимым пакетом: его можно выгрузить, прочитать и вернуть в локальный реестр."
      title="Manifest и import-export"
    >
      <div className="flex flex-wrap gap-3">
        <button
          className="rounded-full bg-black px-5 py-3 text-sm text-white"
          type="button"
          onClick={args.onExport}
        >
          Экспортировать manifest
        </button>
        <button
          className="rounded-full border border-black px-5 py-3 text-sm"
          type="button"
          onClick={() => args.fileInputRef.current?.click()}
        >
          Импортировать manifest
        </button>
        <input
          ref={args.fileInputRef}
          accept="application/json"
          className="hidden"
          type="file"
          onChange={args.onImport}
        />
      </div>
      {args.manifestMessage ? (
        <p className="mt-4 rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/80">
          {args.manifestMessage}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-black/10 bg-[#f8f4ea] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Версия контракта</p>
          <p className="mt-2 text-lg">{args.manifest.version}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-[#f8f4ea] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Что входит в manifest</p>
          <p className="mt-2 text-lg">
            project, components, workflow, workflow template, artifacts summary, prompt brief
          </p>
        </article>
      </div>
      <div className="mt-4">
        <p className="mb-2 text-sm uppercase tracking-wide text-black/50">Предпросмотр manifest</p>
        <ManifestPreview manifestJson={args.manifestJson} />
      </div>
    </SurfaceCard>
  )
}

function WorkflowSurfaceCard(args: {
  workflowTemplate: ReturnType<typeof buildProjectWorkflowTemplateModel>
}) {
  return (
    <SurfaceCard
      description="Workflow здесь читается не как скрытый статус, а как повторяемый recipe проектной работы."
      title="Workflow template и readout"
    >
      <div className="rounded-2xl border border-black/10 bg-[#f8f4ea] p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Выбранный template</p>
        <p className="mt-2 text-2xl">{args.workflowTemplate.title}</p>
        <p className="mt-3 text-sm text-black/70">{args.workflowTemplate.summary}</p>
        <p className="mt-3 text-sm text-black/70">
          Текущий recipe-этап: {args.workflowTemplate.currentStageTitle}
        </p>
        <p className="mt-2 text-sm text-black/70">
          Последняя активность: {args.workflowTemplate.lastActivityLabel}
        </p>
      </div>
      <div className="mt-4 grid gap-3">
        {args.workflowTemplate.steps.map((step) => (
          <article key={step.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{step.title}</strong>
              <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-sm text-black/75">
                {step.statusLabel}
              </span>
            </div>
            <p className="mt-2 text-sm text-black/70">{step.description}</p>
          </article>
        ))}
      </div>
    </SurfaceCard>
  )
}

function ArtifactSurfaceCard(args: {
  artifactLibrary: ReturnType<typeof buildProjectArtifactLibraryModel>
}) {
  return (
    <SurfaceCard
      description="Artifact library удерживает не только код компонента, но и наблюдаемые рабочие материалы проекта."
      title="Artifact library"
    >
      <div className="rounded-2xl border border-black/10 bg-[#f8f4ea] p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Итоговый слой материалов</p>
        <p className="mt-2 text-xl">{args.artifactLibrary.summaryLabel}</p>
      </div>
      <div className="mt-4 grid gap-3">
        {args.artifactLibrary.items.map((item) => (
          <article key={item.id} className="rounded-2xl border border-black/10 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-xs uppercase tracking-wide text-black/45">{item.kindLabel}</p>
                <strong className="mt-1 block">{item.title}</strong>
              </div>
              <span className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-sm text-black/75">
                {item.statusLabel}
              </span>
            </div>
            <p className="mt-3 text-sm text-black/70">{item.summary}</p>
          </article>
        ))}
      </div>
    </SurfaceCard>
  )
}

function PromptBriefSurfaceCard(args: {
  briefMessage: string
  onChange: (value: string) => void
  onSave: () => void
  promptBriefDraft: string
  promptBriefModel: ReturnType<typeof buildProjectPromptBriefModel>
}) {
  return (
    <SurfaceCard
      description="Prompt brief делает context boundary видимым и редактируемым прямо на уровне проекта."
      title="Prompt brief"
    >
      <label className="block">
        <span className="text-sm uppercase tracking-wide text-black/50">Рабочий brief проекта</span>
        <textarea
          className="mt-2 min-h-48 w-full rounded-2xl border border-black/10 bg-[#f8f4ea] p-4 text-sm leading-6 outline-none"
          value={args.promptBriefDraft}
          onChange={(event) => args.onChange(event.target.value)}
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="rounded-full bg-black px-5 py-3 text-sm text-white"
          type="button"
          onClick={args.onSave}
        >
          Сохранить brief
        </button>
        <span className="text-sm text-black/60">
          Canonical prompt context будет брать этот brief как проектный вход.
        </span>
      </div>
      {args.briefMessage ? (
        <p className="mt-4 rounded-2xl border border-black/10 bg-black/[0.03] p-4 text-sm text-black/80">
          {args.briefMessage}
        </p>
      ) : null}
      <div className="mt-4 rounded-2xl border border-black/10 bg-white p-4">
        <p className="text-sm uppercase tracking-wide text-black/50">Откуда brief берёт контекст</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {args.promptBriefModel.sourceLabels.map((label) => (
            <span
              key={label}
              className="rounded-full border border-black/10 bg-black/[0.03] px-3 py-1 text-sm text-black/75"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </SurfaceCard>
  )
}

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
    <section className="mt-6 space-y-4">
      <div>
        <h2 className="text-3xl">Продуктовые объекты проекта</h2>
        <p className="mt-2 max-w-4xl text-lg text-black/70">
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
