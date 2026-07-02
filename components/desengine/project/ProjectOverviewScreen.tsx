"use client"

import Link from "next/link"

import { getProjectsRootUrl } from "@/lib/project/navigation"

import { ProjectComponentsPanel } from "./ProjectComponentsPanel"
import { ProjectOverviewPrimaryFlow } from "./ProjectOverviewPrimaryFlow"
import { ProjectOverviewSupportPanels } from "./ProjectOverviewSupportPanels"
import { ProjectWorkspacePanel } from "./ProjectWorkspacePanel"
import { buildProjectSurfaceModel } from "./projectSurface"
import { useProjectOverview } from "./useProjectOverview"
import { useProjectWorkspace } from "./useProjectWorkspace"

type ProjectOverviewScreenProps = {
  projectId: string
}

function ProjectOverviewLoadingState() {
  return (
    <main className="px-5 py-5">
      <h1 className="py-2 text-8xl">Проект</h1>
      <p className="text-xl">Загружаем обзор проекта...</p>
    </main>
  )
}

function ProjectOverviewErrorState() {
  return (
    <main className="px-5 py-5">
      <h1 className="py-2 text-8xl">Проект</h1>
      <p className="rounded-2xl border border-red-300 bg-red-50 p-4 text-lg text-red-900">
        Не удалось открыть обзор проекта из локального реестра.
      </p>
    </main>
  )
}

function ProjectOverviewMissingState({ projectId }: { projectId: string }) {
  return (
    <main className="px-5 py-5">
      <h1 className="py-2 text-8xl">Проект не найден</h1>
      <p className="max-w-3xl text-xl text-black/70">
        В текущем workspace нет проекта с id <code>{projectId}</code>. Вернитесь к реестру и
        проверьте, что проект уже был создан в этом браузере.
      </p>
      <Link className="mt-6 inline-flex rounded-full border border-black px-4 py-2" href={getProjectsRootUrl()}>
        Вернуться к проектам
      </Link>
    </main>
  )
}

function ProjectOverviewReadyState({ projectId }: ProjectOverviewScreenProps) {
  const state = useProjectOverview(projectId)
  const workspace = useProjectWorkspace(projectId)

  if (state.status === "loading") return <ProjectOverviewLoadingState />
  if (state.status === "error") return <ProjectOverviewErrorState />
  if (state.status === "missing" || !state.project) return <ProjectOverviewMissingState projectId={projectId} />

  const project = buildProjectSurfaceModel(state.project, state.project.id === state.activeProjectId)
  const activeComponent = workspace.session?.activeComponentId
    ? workspace.components.find((component) => component.id === workspace.session?.activeComponentId) ?? null
    : null

  return (
    <main className="px-5 py-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="py-2 text-7xl">{project.title}</h1>
        {project.isActive ? (
          <span className="rounded-full bg-black px-3 py-1 text-sm text-white">активный проект</span>
        ) : null}
      </div>

      <p className="max-w-4xl text-xl text-black/70">
        Проект здесь стал главной рабочей поверхностью. Компоненты, текущий фокус и история работы
        принадлежат проекту и больше не маскируются под отдельные задачи.
      </p>

      <ProjectOverviewPrimaryFlow
        activeComponent={activeComponent}
        componentCount={workspace.components.length}
        session={workspace.session}
      />
      <ProjectComponentsPanel
        activeComponentId={workspace.session?.activeComponentId ?? null}
        components={workspace.components}
        createComponent={workspace.createComponent}
        focusComponent={workspace.focusComponent}
        markComponentCompleted={workspace.markComponentCompleted}
        reopenComponent={workspace.reopenComponent}
        stateStatus={workspace.status}
        workflowReadout={workspace.workflowReadout}
      />
      <ProjectWorkspacePanel
        activeComponent={activeComponent}
        clearFocus={() => void workspace.clearFocus()}
        completedComponentCount={workspace.components.filter((component) => component.status === "completed").length}
        componentCount={workspace.components.length}
        session={workspace.session}
        startProjectWork={() => void workspace.startProjectWork()}
        workflowReadout={workspace.workflowReadout}
      />
      <ProjectOverviewSupportPanels
        historyDiagnostics={workspace.historyDiagnostics}
        isActive={project.isActive}
        onProjectSaved={state.replaceProject}
        project={state.project}
        workflowReadout={workspace.workflowReadout}
      />
    </main>
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
