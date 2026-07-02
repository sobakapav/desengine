"use client"

import Link from "next/link"

import { getProjectsRootUrl } from "@/lib/project/navigation"

import { ProjectConfigPanel } from "./ProjectConfigPanel"
import { ProjectComponentsPanel } from "./ProjectComponentsPanel"
import { ProjectHistoryDiagnosticsPanel } from "./ProjectHistoryDiagnosticsPanel"
import { ProjectWorkflowReadoutPanel } from "./ProjectWorkflowReadoutPanel"
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

function ProjectOverviewMetadata({
  id,
  isActive,
  uiKitTitle,
  storageLabel,
  createdAtLabel,
  updatedAtLabel,
}: Pick<
  ReturnType<typeof buildProjectSurfaceModel>,
  "id" | "isActive" | "uiKitTitle" | "storageLabel" | "createdAtLabel" | "updatedAtLabel"
>) {
  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <dl className="grid gap-4 md:grid-cols-2">
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Идентификатор проекта</dt>
          <dd className="mt-1 text-lg">{id}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Статус</dt>
          <dd className="mt-1 text-lg">{isActive ? "Активный проект" : "Неактивный проект"}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">UI kit</dt>
          <dd className="mt-1 text-lg">{uiKitTitle}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Создан</dt>
          <dd className="mt-1 text-lg">{createdAtLabel}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Хранение</dt>
          <dd className="mt-1 text-lg">{storageLabel}</dd>
        </div>
        <div>
          <dt className="text-sm uppercase tracking-wide text-black/50">Обновлён</dt>
          <dd className="mt-1 text-lg">{updatedAtLabel}</dd>
        </div>
      </dl>
    </section>
  )
}

function ProjectOverviewWorkPath() {
  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-black/[0.03] p-6">
      <h2 className="text-3xl">Как теперь устроена работа</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Здесь больше нет отдельного task-входа. Пользователь работает над проектом целиком, а
        компоненты становятся рабочими частями этого проекта и по очереди входят в фокус.
      </p>

      <ol className="mt-5 grid gap-3 text-base text-black/80 md:grid-cols-4">
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          1. Откройте проект и запустите работу над ним.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          2. Добавьте или уточните состав компонентов проекта.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          3. Сделайте один из компонентов текущим фокусом проекта.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          4. Отмечайте готовые компоненты, не выходя из project surface.
        </li>
      </ol>
    </section>
  )
}

function ProjectOverviewNextSteps() {
  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-[#f8f4ea] p-6">
      <h2 className="text-3xl">Что наблюдать дальше</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Основной критерий этой волны простой: вся ключевая работа над проектом должна читаться
        прямо здесь, без ухода в отдельный task-слой.
      </p>

      <div className="mt-5 grid gap-3 text-base text-black/80 md:grid-cols-3">
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          1. Кнопка запускает работу над проектом, а не переводит вас в отдельную задачу.
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          2. Выбор фокуса меняет сам project surface, а не открывает скрытый runtime.
        </div>
        <div className="rounded-2xl border border-black/10 bg-white p-4">
          3. История и workflow показывают проектную работу понятным пользователю языком.
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="rounded-full border border-black px-4 py-2" href={getProjectsRootUrl()}>
          Все проекты
        </Link>
      </div>
    </section>
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

      <ProjectOverviewWorkPath />
      <ProjectWorkspacePanel
        activeComponent={activeComponent}
        clearFocus={() => void workspace.clearFocus()}
        completedComponentCount={workspace.components.filter((component) => component.status === "completed").length}
        componentCount={workspace.components.length}
        session={workspace.session}
        startProjectWork={() => void workspace.startProjectWork()}
        workflowReadout={workspace.workflowReadout}
      />
      <ProjectOverviewMetadata
        createdAtLabel={project.createdAtLabel}
        id={project.id}
        isActive={project.isActive}
        storageLabel={project.storageLabel}
        uiKitTitle={project.uiKitTitle}
        updatedAtLabel={project.updatedAtLabel}
      />
      <ProjectConfigPanel project={state.project} onProjectSaved={state.replaceProject} />
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
      <ProjectWorkflowReadoutPanel workflowReadout={workspace.workflowReadout} />
      <ProjectHistoryDiagnosticsPanel historyDiagnostics={workspace.historyDiagnostics} />
      <ProjectOverviewNextSteps />
    </main>
  )
}

function ProjectOverviewScreen({ projectId }: ProjectOverviewScreenProps) {
  return <ProjectOverviewReadyState projectId={projectId} />
}

export { ProjectOverviewScreen }
