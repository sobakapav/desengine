"use client"

import type { ChangeEvent, ReactNode, RefObject } from "react"

import type { ProjectManifest } from "@/lib/project/manifest"

import {
  buildProjectArtifactLibraryModel,
  buildProjectPromptBriefModel,
  buildProjectWorkflowTemplateModel,
} from "./projectProductSurface"

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
    <article className="shell-card border border-black bg-white p-5">
      <h3 className="text-2xl">{title}</h3>
      <p className="mt-2 text-base shell-prose-muted">{description}</p>
      <div className="mt-5">{children}</div>
    </article>
  )
}

function ManifestPreview({ manifestJson }: { manifestJson: string }) {
  return (
    <pre className="shell-card max-h-96 overflow-auto border border-black bg-white p-4 text-xs leading-6 text-black/80">
      {manifestJson}
    </pre>
  )
}

function ManifestSurfaceCard(args: {
  fileInputRef: RefObject<HTMLInputElement | null>
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
          className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white"
          type="button"
          onClick={args.onExport}
        >
          Экспортировать manifest
        </button>
        <button
          className="shell-button-secondary inline-flex items-center border border-black bg-white px-5 py-3"
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
        <p className="shell-callout mt-4 border border-dashed border-black bg-white p-4 text-sm text-black/80">
          {args.manifestMessage}
        </p>
      ) : null}
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="shell-card-muted border border-black bg-neutral-50 p-4">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Версия контракта</p>
          <p className="mt-2 text-lg">{args.manifest.version}</p>
        </article>
        <article className="shell-card-muted border border-black bg-neutral-50 p-4">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Что входит в manifest</p>
          <p className="mt-2 text-lg">
            project, components, workflow, workflow template, artifacts summary, prompt brief
          </p>
        </article>
      </div>
      <div className="mt-4">
        <p className="shell-eyebrow mb-2 text-xs uppercase tracking-[0.22em]">Предпросмотр manifest</p>
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
      <div className="shell-card-muted border border-black bg-neutral-50 p-4">
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Выбранный template</p>
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
          <article key={step.id} className="shell-card border border-black bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <strong>{step.title}</strong>
              <span className="shell-badge inline-flex items-center border border-black bg-white px-3 py-1 text-sm">
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
      <div className="shell-card-muted border border-black bg-neutral-50 p-4">
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Итоговый слой материалов</p>
        <p className="mt-2 text-xl">{args.artifactLibrary.summaryLabel}</p>
      </div>
      <div className="mt-4 grid gap-3">
        {args.artifactLibrary.items.map((item) => (
          <article key={item.id} className="shell-card border border-black bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">{item.kindLabel}</p>
                <strong className="mt-1 block">{item.title}</strong>
              </div>
              <span className="shell-badge inline-flex items-center border border-black bg-white px-3 py-1 text-sm">
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
        <span className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Рабочий brief проекта</span>
        <textarea
          className="shell-field mt-2 min-h-48 w-full border border-black bg-white px-4 py-3 text-sm leading-6 outline-none"
          value={args.promptBriefDraft}
          onChange={(event) => args.onChange(event.target.value)}
        />
      </label>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white"
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
        <p className="shell-callout mt-4 border border-dashed border-black bg-white p-4 text-sm text-black/80">
          {args.briefMessage}
        </p>
      ) : null}
      <div className="shell-card mt-4 border border-black bg-white p-4">
        <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Откуда brief берёт контекст</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {args.promptBriefModel.sourceLabels.map((label) => (
            <span
              key={label}
              className="shell-badge inline-flex items-center border border-black bg-white px-3 py-1 text-sm"
            >
              {label}
            </span>
          ))}
        </div>
      </div>
    </SurfaceCard>
  )
}

export {
  ArtifactSurfaceCard,
  ManifestSurfaceCard,
  PromptBriefSurfaceCard,
  WorkflowSurfaceCard,
}
