"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

import { applyProjectConfigDraft, buildProjectConfigDraft } from "@/lib/project/config-surface"
import { saveProjectOnServer } from "@/lib/project/client"
import { getProjectsRootUrl } from "@/lib/project/navigation"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import { ProjectComponentsPanel } from "./ProjectComponentsPanel"
import { ProjectOverviewPrimaryFlow } from "./ProjectOverviewPrimaryFlow"
import { ProjectOverviewSupportPanels } from "./ProjectOverviewSupportPanels"
import { ProjectProductSurfacesPanel } from "./ProjectProductSurfacesPanel"
import { ProjectWorkbenchPanel } from "./ProjectWorkbenchPanel"
import { buildProjectSurfaceModel, listProjectUiKitOptions } from "./projectSurface"
import { ProjectWorkspacePanel } from "./ProjectWorkspacePanel"
import { useProjectOverview } from "./useProjectOverview"
import { useProjectWorkspace } from "./useProjectWorkspace"

type ProjectOverviewScreenProps = {
  projectId: string
}

type ProjectOverviewBodyProps = {
  project: ReturnType<typeof buildProjectSurfaceModel>
  projectData: NonNullable<ReturnType<typeof useProjectOverview>["project"]>
  projectSurface: ReturnType<typeof useProjectOverview>["surface"]
  replaceProject: ReturnType<typeof useProjectOverview>["replaceProject"]
  rootPath: string | null
  workspace: ReturnType<typeof useProjectWorkspace>
}

function ProjectOverviewLoadingState() {
  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Обзор проекта</p>
      <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">Проект</h1>
      <p className="text-xl">Загружаем обзор проекта...</p>
    </main>
  )
}

function ProjectOverviewErrorState() {
  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Обзор проекта</p>
      <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">Проект</h1>
      <p className="shell-callout border border-dashed border-black bg-white p-4 text-lg">
        Не удалось открыть обзор проекта из дискового реестра.
      </p>
    </main>
  )
}

function ProjectOverviewMissingState({ projectId }: { projectId: string }) {
  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Обзор проекта</p>
      <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">Проект не найден</h1>
      <p className="max-w-3xl text-xl text-black/70">
        В текущем registry нет проекта с id <code>{projectId}</code>. Вернитесь к реестру и
        проверьте путь на сервере или подключение проекта с диска.
      </p>
      <Link className="shell-button-secondary mt-6 inline-flex items-center border border-black bg-white px-4 py-2 no-underline" href={getProjectsRootUrl()}>
        Вернуться к проектам
      </Link>
    </main>
  )
}

function ProjectUiKitQuickControl(args: {
  project: ProjectWorkspace
  onProjectSaved: ProjectOverviewBodyProps["replaceProject"]
}) {
  const [selectedUiKitId, setSelectedUiKitId] = useState(args.project.settings.uiKitId)
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle")
  const [message, setMessage] = useState("")
  const uiKitOptions = listProjectUiKitOptions()

  useEffect(() => {
    setSelectedUiKitId(args.project.settings.uiKitId)
  }, [args.project.id, args.project.settings.uiKitId])

  async function handleChange(nextUiKitId: ProjectWorkspace["settings"]["uiKitId"]) {
    setSelectedUiKitId(nextUiKitId)
    setSaveState("saving")
    setMessage("")

    try {
      const nextProject = applyProjectConfigDraft(args.project, {
        ...buildProjectConfigDraft(args.project),
        uiKitId: nextUiKitId,
      })
      const response = await saveProjectOnServer({ project: nextProject, previousProjectId: args.project.id })
      args.onProjectSaved(response.project, {
        rootPath: response.rootPath,
        surface: response.surface,
      })
      setSaveState("saved")
      setMessage("UI kit проекта сохранён.")
    } catch (error) {
      setSelectedUiKitId(args.project.settings.uiKitId)
      setSaveState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось сохранить UI kit проекта.")
    }
  }

  return (
    <section className="mt-6 border-2 border-black bg-white p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-[18rem] flex-1">
          <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Управление UI kit</p>
          <h2 className="mt-2 text-3xl">UI kit проекта</h2>
          <p className="mt-2 max-w-3xl text-base text-black/72">
            Проект использует только поддержанные системой адаптеры UI kit. Их зависимости
            поставляет сам desengine, а локальная кастомизация не считается устойчивой частью контракта.
          </p>
        </div>

        <label className="min-w-[18rem] flex-1">
          <span className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Выбрать UI kit</span>
          <select
            className="shell-field mt-2 w-full border border-black bg-white px-4 py-3"
            value={selectedUiKitId}
            onChange={(event) => void handleChange(event.target.value as ProjectWorkspace["settings"]["uiKitId"])}
          >
            {uiKitOptions.map((kit) => (
              <option key={kit.id} value={kit.id}>
                {kit.title} ({kit.id})
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mt-4 grid gap-3 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="border border-black bg-neutral-50 p-4 text-sm text-black/75">
          <p>Текущий адаптер сразу влияет на предпросмотр, prompt-контекст и совместимость проектного кода.</p>
          <p className="mt-2">Если система позже обновит адаптер, ручная кастомизация может быть перезаписана.</p>
        </div>
        <div className="border border-black bg-white p-4 text-sm text-black/75">
          <p>Пользователь не устанавливает kit вручную: desengine работает только со встроенными адаптерами из собственного каталога.</p>
          {message ? (
            <p className="mt-2 border border-dashed border-black bg-white px-3 py-2 text-black">
              {saveState === "saving" ? "Сохраняем..." : message}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  )
}

function ProjectOverviewHeader({
  project,
  projectData,
  replaceProject,
}: Pick<ProjectOverviewBodyProps, "project" | "projectData" | "replaceProject">) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">{project.title}</h1>
        {project.isActive ? (
          <span className="shell-badge-invert inline-flex items-center border border-black bg-black px-3 py-1 text-sm text-white">активный проект</span>
        ) : null}
      </div>

      <p className="shell-lead max-w-4xl text-[1.55rem] leading-[1.35] text-black/72">
        Проект здесь стал главной рабочей поверхностью. Компоненты, линии работы и история
        принадлежат проекту и больше не маскируются под отдельные служебные сущности.
      </p>

      <div className="mt-5 flex flex-wrap gap-3 text-sm text-black/72">
        <span className="inline-flex items-center border border-black px-3 py-1">
          код: <code className="ml-2">{project.code}</code>
        </span>
        <span className="inline-flex items-center border border-black px-3 py-1">{project.figmaFilesCountLabel}</span>
        <span className="inline-flex items-center border border-black px-3 py-1">граф компонентов: {project.componentGraphLabel}</span>
        <span className="inline-flex items-center border border-black px-3 py-1">граф экранов: {project.screenGraphLabel}</span>
        <span className="inline-flex items-center border border-black px-3 py-1">архив: {project.archiveSummaryLabel}</span>
      </div>

      <ProjectUiKitQuickControl project={projectData} onProjectSaved={replaceProject} />
    </>
  )
}

function ProjectOverviewSections({
  completedComponentCount,
  inProgressComponentCount,
  project,
  projectData,
  projectSurface,
  replaceProject,
  rootPath,
  workspace,
}: ProjectOverviewBodyProps & {
  completedComponentCount: number
  inProgressComponentCount: number
}) {
  return (
    <>
      <ProjectOverviewPrimaryFlow
        componentCount={workspace.components.length}
        inProgressComponentCount={inProgressComponentCount}
        session={workspace.session}
      />
      <ProjectComponentsPanel
        components={workspace.components}
        createComponent={workspace.createComponent}
        markComponentCompleted={workspace.markComponentCompleted}
        reopenComponent={workspace.reopenComponent}
        stateStatus={workspace.status}
        startComponentWork={workspace.startComponentWork}
        workflowReadout={workspace.workflowReadout}
      />
      <ProjectWorkspacePanel
        completedComponentCount={completedComponentCount}
        componentCount={workspace.components.length}
        inProgressComponentCount={inProgressComponentCount}
        session={workspace.session}
        startProjectWork={() => void workspace.startProjectWork()}
        workflowReadout={workspace.workflowReadout}
      />
      <ProjectWorkbenchPanel projectId={project.id} sessions={workspace.workbenches} />
      <ProjectProductSurfacesPanel
        components={workspace.components}
        historyDiagnostics={workspace.historyDiagnostics}
        onProjectSaved={replaceProject}
        project={projectData}
        session={workspace.session}
        workflowReadout={workspace.workflowReadout}
      />
      <ProjectOverviewSupportPanels
        historyDiagnostics={workspace.historyDiagnostics}
        isActive={project.isActive}
        onProjectSaved={replaceProject}
        project={projectData}
        projectSurface={projectSurface}
        rootPath={rootPath}
        workflowReadout={workspace.workflowReadout}
      />
    </>
  )
}

function ProjectOverviewBody({
  project,
  projectData,
  projectSurface,
  replaceProject,
  rootPath,
  workspace,
}: ProjectOverviewBodyProps) {
  const completedComponentCount = workspace.components.filter((component) => component.status === "completed").length
  const inProgressComponentCount = workspace.components.filter((component) => component.status === "in_progress").length

  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project overview</p>
      <ProjectOverviewHeader
        project={project}
        projectData={projectData}
        replaceProject={replaceProject}
      />
      <ProjectOverviewSections
        completedComponentCount={completedComponentCount}
        inProgressComponentCount={inProgressComponentCount}
        project={project}
        projectData={projectData}
        projectSurface={projectSurface}
        replaceProject={replaceProject}
        rootPath={rootPath}
        workspace={workspace}
      />
    </main>
  )
}

function ProjectOverviewReadyState({ projectId }: ProjectOverviewScreenProps) {
  const state = useProjectOverview(projectId)
  const workspace = useProjectWorkspace(state.project)

  if (state.status === "loading") return <ProjectOverviewLoadingState />
  if (state.status === "error") return <ProjectOverviewErrorState />
  if (state.status === "missing" || !state.project) return <ProjectOverviewMissingState projectId={projectId} />

  return (
    <ProjectOverviewBody
      project={buildProjectSurfaceModel(
        state.project,
        state.project.id === state.activeProjectId,
        state.rootPath,
        state.surface,
      )}
      projectData={state.project}
      projectSurface={state.surface}
      replaceProject={state.replaceProject}
      rootPath={state.rootPath}
      workspace={workspace}
    />
  )
}

/**
 * @example
 * ```tsx
 * <ProjectOverviewScreen projectId="project-a" />
 * ```
 */
function ProjectOverviewScreen({ projectId }: ProjectOverviewScreenProps) {
  return <ProjectOverviewReadyState projectId={projectId} />
}

export { ProjectOverviewScreen }
