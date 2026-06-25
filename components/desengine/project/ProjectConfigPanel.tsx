"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import {
  applyProjectConfigDraft,
  buildProjectConfigDraft,
  validateProjectConfigDraft,
  type ProjectConfigDraft,
} from "@/lib/project/config-surface"
import { getProjectUrl } from "@/lib/project/navigation"
import { createBrowserProjectStorage } from "@/lib/project/storage"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import {
  buildProjectConfigContractModel,
  listProjectUiKitOptions,
} from "./projectSurface"

type ProjectConfigPanelProps = {
  project: ProjectWorkspace
  onProjectSaved: (project: ProjectWorkspace) => void
}

function ProjectConfigPanel({
  project,
  onProjectSaved,
}: ProjectConfigPanelProps) {
  const router = useRouter()
  const [draft, setDraft] = useState<ProjectConfigDraft>(() => buildProjectConfigDraft(project))
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    setDraft(buildProjectConfigDraft(project))
    setSaveState("idle")
    setMessage("")
  }, [project.id, project.title, project.updatedAt, project.settings.uiKitId])

  const validatedDraft = validateProjectConfigDraft(draft)
  const draftProject = validatedDraft.ok ? applyProjectConfigDraft(project, validatedDraft.draft) : project
  const contract = buildProjectConfigContractModel(draftProject)
  const uiKitOptions = listProjectUiKitOptions()

  async function handleSave() {
    if (!validatedDraft.ok) {
      setSaveState("error")
      setMessage(validatedDraft.message)
      return
    }

    setSaveState("saving")
    setMessage("")

    try {
      const nextProject = applyProjectConfigDraft(project, validatedDraft.draft)
      const storage = createBrowserProjectStorage({ storage: window.localStorage })

      await storage.saveProject(nextProject, project.id)
      onProjectSaved(nextProject)
      setDraft(buildProjectConfigDraft(nextProject))
      setSaveState("saved")
      setMessage("Конфигурация проекта сохранена в локальном реестре браузера.")

      if (nextProject.id !== project.id) {
        router.replace(getProjectUrl(nextProject.id))
      }
    } catch (error) {
      setSaveState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить конфигурацию проекта.")
    }
  }

  function handleReset() {
    setDraft(buildProjectConfigDraft(project))
    setSaveState("idle")
    setMessage("")
  }

  function updateDraft(patch: Partial<ProjectConfigDraft>) {
    setDraft((currentDraft) => ({
      ...currentDraft,
      ...patch,
    }))
    setSaveState("idle")
    setMessage("")
  }

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">Конфигурация проекта</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Здесь настраиваются основные пользовательские поля проекта: название, идентификатор и
            выбранный UI kit.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
        <div className="space-y-4">
          <label className="block">
            <span className="text-sm uppercase tracking-wide text-black/50">Название проекта</span>
            <input
              className="mt-2 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base"
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
            />
          </label>

          <label className="block">
            <span className="text-sm uppercase tracking-wide text-black/50">Идентификатор проекта</span>
            <input
              className="mt-2 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 font-mono text-base"
              value={draft.id}
              onChange={(event) => updateDraft({ id: event.target.value })}
            />
          </label>

          <label className="block">
            <span className="text-sm uppercase tracking-wide text-black/50">Выбранный UI kit</span>
            <select
              className="mt-2 w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base"
              value={draft.uiKitId}
              onChange={(event) => updateDraft({ uiKitId: event.target.value as ProjectWorkspace["settings"]["uiKitId"] })}
            >
              {uiKitOptions.map((kit) => (
                <option key={kit.id} value={kit.id}>
                  {kit.title} ({kit.id})
                </option>
              ))}
            </select>
          </label>

          <div className="flex flex-wrap gap-3">
            <button
              className="rounded-full bg-black px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-black/40"
              disabled={saveState === "saving"}
              type="button"
              onClick={() => void handleSave()}
            >
              {saveState === "saving" ? "Сохраняем…" : "Сохранить проект"}
            </button>
            <button
              className="rounded-full border border-black px-5 py-3 text-sm"
              type="button"
              onClick={handleReset}
            >
              Вернуть текущее состояние
            </button>
          </div>

          {validatedDraft.ok ? (
            <p className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950">
              Данные проекта готовы к сохранению: `id={validatedDraft.draft.id}`, `title={validatedDraft.draft.title}`,
              `uiKitId={validatedDraft.draft.uiKitId}`.
            </p>
          ) : (
            <p className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
              Проверьте поля проекта: {validatedDraft.message}
            </p>
          )}

          {message ? (
            <p className={`rounded-2xl border p-4 text-sm ${saveState === "error"
              ? "border-red-300 bg-red-50 text-red-900"
              : "border-black/10 bg-black/[0.03] text-black/80"}`}
            >
              {message}
            </p>
          ) : null}
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-black/10 bg-black/[0.03] p-5">
            <h3 className="text-2xl">Текущий контракт проекта</h3>
            <dl className="mt-4 grid gap-3 text-base">
              <div>
                <dt className="text-black/60">Название</dt>
                <dd>{draftProject.title}</dd>
              </div>
              <div>
                <dt className="text-black/60">Идентификатор</dt>
                <dd><code>{draftProject.id}</code></dd>
              </div>
              <div>
                <dt className="text-black/60">Выбранный kit</dt>
                <dd>{contract.selectedUiKitTitle} ({contract.selectedUiKitId})</dd>
              </div>
              <div>
                <dt className="text-black/60">Хранение</dt>
                <dd>Локально в браузере</dd>
              </div>
            </dl>
          </div>

          <div className="rounded-3xl border border-black/10 bg-white p-5">
            <h3 className="text-2xl">Доступные UI kit</h3>
            <div className="mt-4 grid gap-3">
              {uiKitOptions.map((kit) => (
                <article key={kit.id} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <strong>{kit.title}</strong>
                    <code>{kit.id}</code>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
            <h3 className="text-2xl">Связь с подсказками и предпросмотром</h3>
            <p className="mt-3 text-sm text-black/75">
              `project.uiKitId`, `project.uiKitTitle`, `user.designSystemId` и
              `user.designSystemName` читаются из одного источника настроек проекта.
            </p>
            <pre className="mt-4 overflow-x-auto rounded-2xl border border-black/10 bg-white p-4 text-xs leading-6 text-black/80">
              {contract.promptPreviewContractJson}
            </pre>
          </div>
        </div>
      </div>
    </section>
  )
}

export { ProjectConfigPanel }
