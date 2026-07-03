"use client"

import Link from "next/link"

import { getProjectsRootUrl } from "@/lib/project/navigation"

import { ProjectComponentsPanel } from "./ProjectComponentsPanel"
import { ProjectOverviewPrimaryFlow } from "./ProjectOverviewPrimaryFlow"
import { ProjectOverviewSupportPanels } from "./ProjectOverviewSupportPanels"
import { ProjectProductSurfacesPanel } from "./ProjectProductSurfacesPanel"
import { ProjectWorkbenchPanel } from "./ProjectWorkbenchPanel"
import { buildProjectSurfaceModel } from "./projectSurface"
import { ProjectWorkspacePanel } from "./ProjectWorkspacePanel"
import { useProjectOverview } from "./useProjectOverview"
import { useProjectWorkspace } from "./useProjectWorkspace"

type ProjectOverviewScreenProps = {
  projectId: string
}

type ProjectOverviewBodyProps = {
  project: ReturnType<typeof buildProjectSurfaceModel>
  projectData: NonNullable<ReturnType<typeof useProjectOverview>["project"]>
  replaceProject: ReturnType<typeof useProjectOverview>["replaceProject"]
  workspace: ReturnType<typeof useProjectWorkspace>
}

function ProjectOverviewLoadingState() {
  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project overview</p>
      <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">Проект</h1>
      <p className="text-xl">Загружаем обзор проекта...</p>
    </main>
  )
}

function ProjectOverviewErrorState() {
  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project overview</p>
      <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">Проект</h1>
      <p className="shell-callout border border-dashed border-black bg-white p-4 text-lg">
        Не удалось открыть обзор проекта из локального реестра.
      </p>
    </main>
  )
}

function ProjectOverviewMissingState({ projectId }: { projectId: string }) {
  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project overview</p>
      <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">Проект не найден</h1>
      <p className="max-w-3xl text-xl text-black/70">
        В текущем workspace нет проекта с id <code>{projectId}</code>. Вернитесь к реестру и
        проверьте, что проект уже был создан в этом браузере.
      </p>
      <Link className="shell-button-secondary mt-6 inline-flex items-center border border-black bg-white px-4 py-2 no-underline" href={getProjectsRootUrl()}>
        Вернуться к проектам
      </Link>
    </main>
  )
}

function ProjectOverviewHeader({ project }: Pick<ProjectOverviewBodyProps, "project">) {
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
        принадлежат проекту и больше не маскируются под отдельные задачи.
      </p>
    </>
  )
}

function ProjectOverviewSections({
  completedComponentCount,
  inProgressComponentCount,
  project,
  projectData,
  replaceProject,
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
        workflowReadout={workspace.workflowReadout}
      />
    </>
  )
}

function ProjectOverviewBody({
  project,
  projectData,
  replaceProject,
  workspace,
}: ProjectOverviewBodyProps) {
  const completedComponentCount = workspace.components.filter((component) => component.status === "completed").length
  const inProgressComponentCount = workspace.components.filter((component) => component.status === "in_progress").length

  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project overview</p>
      <ProjectOverviewHeader project={project} />
      <ProjectOverviewSections
        completedComponentCount={completedComponentCount}
        inProgressComponentCount={inProgressComponentCount}
        project={project}
        projectData={projectData}
        replaceProject={replaceProject}
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
      project={buildProjectSurfaceModel(state.project, state.project.id === state.activeProjectId)}
      projectData={state.project}
      replaceProject={state.replaceProject}
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
