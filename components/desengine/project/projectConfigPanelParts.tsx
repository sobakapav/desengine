"use client"

import type { ProjectConfigDraft } from "@/lib/project/config-surface"
import type { ProjectSurfaceSummary } from "@/lib/project/client"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import {
  buildProjectConfigContractModel,
  listProjectUiKitOptions,
} from "./projectSurface"

type ProjectConfigEditorProps = {
  draft: ProjectConfigDraft & { code: string }
  message: string
  saveState: "idle" | "saving" | "saved" | "error"
  validationMessage: string
  validationOk: boolean
  onReset: () => void
  onSave: () => void
  onUpdate: (patch: Partial<ProjectConfigDraft & { code: string }>) => void
}

function ProjectConfigFields(args: {
  draft: ProjectConfigDraft & { code: string }
  onUpdate: (patch: Partial<ProjectConfigDraft & { code: string }>) => void
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
        <span className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Код проекта</span>
        <input
          className="shell-field mt-2 w-full border border-black bg-white px-4 py-3 font-mono"
          value={args.draft.code}
          onChange={(event) => args.onUpdate({ code: event.target.value })}
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

      <div className="border border-dashed border-black bg-neutral-50 p-4 text-sm text-black/75">
        <p>UI kit проекта теперь выбирается в верхнем слое страницы проекта.</p>
        <p className="mt-2">
          Здесь остаются название, код и идентификатор, а выбор встроенного UI kit выполняется
          отдельно как часть главного рабочего контура проекта.
        </p>
      </div>
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
        {args.saveState === "saving" ? "Сохраняем…" : "Сохранить сейчас"}
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
  draft: ProjectConfigDraft & { code: string }
  message: string
  validationMessage: string
  validationOk: boolean
}) {
  return (
    <>
      <p className="shell-callout border border-dashed border-black bg-white p-4 text-sm">
        {args.validationOk
          ? `Данные проекта готовы к сохранению: title=${args.draft.title}, code=${args.draft.code}, id=${args.draft.id}, uiKitId=${args.draft.uiKitId}.`
          : `Проверьте поля проекта: ${args.validationMessage}`}
      </p>

      <p className="text-sm text-black/60">
        Изменения также сохраняются автоматически на диск после правок.
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
  projectSurface: ProjectSurfaceSummary | null
  rootPath?: string | null
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
            <dt className="text-black/60">Код проекта</dt>
            <dd><code>{args.contract.code}</code></dd>
          </div>
          <div>
            <dt className="text-black/60">Выбранный kit</dt>
            <dd>{args.contract.selectedUiKitTitle} ({args.contract.selectedUiKitId})</dd>
          </div>
          <div>
            <dt className="text-black/60">Хранение</dt>
            <dd>На диске сервера</dd>
          </div>
          <div>
            <dt className="text-black/60">Server path</dt>
            <dd><code>{args.rootPath?.trim() || "путь на сервере пока не прочитан"}</code></dd>
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
          `project.code`, `project.uiKitId`, `project.uiKitTitle`, `user.designSystemId` и
          `user.designSystemName` читаются из одного источника настроек проекта.
        </p>
        <pre className="shell-card mt-4 overflow-x-auto border border-black bg-white p-4 text-xs leading-6 text-black/80">
          {args.contract.promptPreviewContractJson}
        </pre>
      </div>

      <div className="shell-card-muted border border-black bg-neutral-50 p-5">
        <h3 className="text-2xl">Sources foundation</h3>
        <dl className="mt-4 grid gap-3 text-base">
          <div>
            <dt className="text-black/60">Figma-файлы</dt>
            <dd>{args.projectSurface?.figmaFiles.length ?? 0}</dd>
          </div>
          <div>
            <dt className="text-black/60">Граф компонентов</dt>
            <dd>{args.projectSurface?.componentGraph.nodeCount ?? 0} узл. / {args.projectSurface?.componentGraph.edgeCount ?? 0} связей</dd>
          </div>
          <div>
            <dt className="text-black/60">Граф экранов</dt>
            <dd>{args.projectSurface?.screenGraph.nodeCount ?? 0} узл. / {args.projectSurface?.screenGraph.edgeCount ?? 0} связей</dd>
          </div>
          <div>
            <dt className="text-black/60">Группы архива</dt>
            <dd>{args.projectSurface?.archiveGroups.length ?? 0}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

export { ProjectConfigEditor, ProjectConfigSidebar }
