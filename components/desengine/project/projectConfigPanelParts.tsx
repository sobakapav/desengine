"use client"

import type { ProjectConfigDraft } from "@/lib/project/config-surface"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import {
  buildProjectConfigContractModel,
  listProjectUiKitOptions,
} from "./projectSurface"

type ProjectConfigEditorProps = {
  draft: ProjectConfigDraft
  message: string
  saveState: "idle" | "saving" | "saved" | "error"
  uiKitOptions: ReturnType<typeof listProjectUiKitOptions>
  validationMessage: string
  validationOk: boolean
  onReset: () => void
  onSave: () => void
  onUpdate: (patch: Partial<ProjectConfigDraft>) => void
}

function ProjectConfigFields(args: {
  draft: ProjectConfigDraft
  uiKitOptions: ReturnType<typeof listProjectUiKitOptions>
  onUpdate: (patch: Partial<ProjectConfigDraft>) => void
}) {
  return (
    <>
      <label className="block">
        <span className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Название проекта</span>
        <input
          className="shell-field mt-2 w-full border border-black bg-white px-4 py-3"
          value={args.draft.title}
          onChange={(event) => args.onUpdate({ title: event.target.value })}
        />
      </label>

      <label className="block">
        <span className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Идентификатор проекта</span>
        <input
          className="shell-field mt-2 w-full border border-black bg-white px-4 py-3 font-mono"
          value={args.draft.id}
          onChange={(event) => args.onUpdate({ id: event.target.value })}
        />
      </label>

      <label className="block">
        <span className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Выбранный UI kit</span>
        <select
          className="shell-field mt-2 w-full border border-black bg-white px-4 py-3"
          value={args.draft.uiKitId}
          onChange={(event) => args.onUpdate({ uiKitId: event.target.value as ProjectWorkspace["settings"]["uiKitId"] })}
        >
          {args.uiKitOptions.map((kit) => (
            <option key={kit.id} value={kit.id}>
              {kit.title} ({kit.id})
            </option>
          ))}
        </select>
      </label>
    </>
  )
}

function ProjectConfigActions(args: {
  saveState: "idle" | "saving" | "saved" | "error"
  onReset: () => void
  onSave: () => void
}) {
  return (
    <div className="flex flex-wrap gap-3">
      <button
        className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-45"
        disabled={args.saveState === "saving"}
        type="button"
        onClick={args.onSave}
      >
        {args.saveState === "saving" ? "Сохраняем…" : "Сохранить проект"}
      </button>
      <button
        className="shell-button-secondary inline-flex items-center border border-black bg-white px-5 py-3"
        type="button"
        onClick={args.onReset}
      >
        Вернуть текущее состояние
      </button>
    </div>
  )
}

function ProjectConfigFeedback(args: {
  draft: ProjectConfigDraft
  message: string
  validationMessage: string
  validationOk: boolean
}) {
  return (
    <>
      <p className="shell-callout border border-dashed border-black bg-white p-4 text-sm">
        {args.validationOk
          ? `Данные проекта готовы к сохранению: id=${args.draft.id}, title=${args.draft.title}, uiKitId=${args.draft.uiKitId}.`
          : `Проверьте поля проекта: ${args.validationMessage}`}
      </p>

      {args.message ? (
        <p className="shell-callout border border-dashed border-black bg-white p-4 text-sm">
          {args.message}
        </p>
      ) : null}
    </>
  )
}

function ProjectConfigEditor(args: ProjectConfigEditorProps) {
  return (
    <div className="space-y-4">
      <ProjectConfigFields
        draft={args.draft}
        uiKitOptions={args.uiKitOptions}
        onUpdate={args.onUpdate}
      />
      <ProjectConfigActions
        saveState={args.saveState}
        onReset={args.onReset}
        onSave={args.onSave}
      />
      <ProjectConfigFeedback
        draft={args.draft}
        message={args.message}
        validationMessage={args.validationMessage}
        validationOk={args.validationOk}
      />
    </div>
  )
}

function ProjectConfigSidebar(args: {
  contract: ReturnType<typeof buildProjectConfigContractModel>
  draftProject: ProjectWorkspace
  uiKitOptions: ReturnType<typeof listProjectUiKitOptions>
}) {
  return (
    <div className="space-y-4">
      <div className="shell-card-muted border border-black bg-neutral-50 p-5">
        <h3 className="text-2xl">Текущий контракт проекта</h3>
        <dl className="mt-4 grid gap-3 text-base">
          <div>
            <dt className="text-black/60">Название</dt>
            <dd>{args.draftProject.title}</dd>
          </div>
          <div>
            <dt className="text-black/60">Идентификатор</dt>
            <dd><code>{args.draftProject.id}</code></dd>
          </div>
          <div>
            <dt className="text-black/60">Выбранный kit</dt>
            <dd>{args.contract.selectedUiKitTitle} ({args.contract.selectedUiKitId})</dd>
          </div>
          <div>
            <dt className="text-black/60">Хранение</dt>
            <dd>Локально в браузере</dd>
          </div>
        </dl>
      </div>

      <div className="shell-card border border-black bg-white p-5">
        <h3 className="text-2xl">Доступные UI kit</h3>
        <div className="mt-4 grid gap-3">
          {args.uiKitOptions.map((kit) => (
            <article key={kit.id} className="shell-card-muted border border-black bg-neutral-50 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong>{kit.title}</strong>
                <code>{kit.id}</code>
              </div>
            </article>
          ))}
        </div>
      </div>

      <div className="shell-section-muted border border-black bg-neutral-50 p-5">
        <h3 className="text-2xl">Связь с подсказками и предпросмотром</h3>
        <p className="mt-3 text-sm text-black/75">
          `project.uiKitId`, `project.uiKitTitle`, `user.designSystemId` и
          `user.designSystemName` читаются из одного источника настроек проекта.
        </p>
        <pre className="shell-card mt-4 overflow-x-auto border border-black bg-white p-4 text-xs leading-6 text-black/80">
          {args.contract.promptPreviewContractJson}
        </pre>
      </div>
    </div>
  )
}

export { ProjectConfigEditor, ProjectConfigSidebar }
