"use client"

import Link from "next/link"

import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkflowTaskCatalogItem } from "@/components/desengine/project/projectComponentWorkflow"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import { getProjectsRootUrl } from "@/lib/project/navigation"
import { getProjectUrl } from "@/lib/project/navigation"
import { getTaskUrl } from "@/lib/task/navigation"
import { getTasksRootUrl } from "@/lib/task/navigation"

import { ProjectConfigPanel } from "./ProjectConfigPanel"
import { ProjectComponentsPanel } from "./ProjectComponentsPanel"
import { ProjectHistoryDiagnosticsPanel } from "./ProjectHistoryDiagnosticsPanel"
import { ProjectWorkflowReadoutPanel } from "./ProjectWorkflowReadoutPanel"
import { buildProjectSurfaceModel } from "./projectSurface"
import { useProjectOverview } from "./useProjectOverview"
import { useProjectTaskBindings } from "./useProjectTaskBindings"

type ProjectOverviewScreenProps = {
  projectId: string
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
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

function ProjectOverviewNextSteps() {
  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-black/[0.03] p-6">
      <h2 className="text-3xl">Что делать дальше</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Если проект уже выбран, дальше путь простой: создайте компонент, откройте работу над ним и
        возвращайтесь в проект, когда захотите продолжить ту же сессию.
      </p>

      <ol className="mt-5 grid gap-3 text-base text-black/80 md:grid-cols-3">
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          1. Создайте компонент в этом проекте.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          2. Нажмите `Работать над компонентом`, чтобы открыть работу.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          3. Возвращайтесь к карточке компонента и продолжайте ту же работу через `Продолжить работу`.
        </li>
      </ol>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link className="rounded-full border border-black px-4 py-2" href={getProjectsRootUrl()}>
          Все проекты
        </Link>
        <Link className="rounded-full border border-black px-4 py-2" href={getTasksRootUrl()}>
          Открыть задачи
        </Link>
      </div>
    </section>
  )
}

function ProjectOverviewWorkPath() {
  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-[#f8f4ea] p-6">
      <h2 className="text-3xl">Как здесь идёт работа</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Проект держит общий контекст. Компонент выделяет отдельную часть работы. Задача открывает
        саму рабочую сессию, к которой потом можно вернуться без потери контекста.
      </p>

      <ol className="mt-5 grid gap-3 text-base text-black/80 md:grid-cols-4">
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          1. Откройте проект и проверьте его настройки.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          2. Создайте компонент, с которым хотите работать.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          3. Нажмите `Работать над компонентом`, чтобы открыть работу.
        </li>
        <li className="rounded-2xl border border-black/10 bg-white p-4">
          4. Возвращайтесь в проект и продолжайте ту же работу позже.
        </li>
      </ol>
    </section>
  )
}

function ProjectOverviewTaskBindings({ projectId }: { projectId: string }) {
  const state = useProjectTaskBindings(projectId)

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-3xl">Связанные задачи</h2>
        <Link className="rounded-full border border-black px-4 py-2" href={getTasksRootUrl()}>
          Все задачи
        </Link>
      </div>

      {state.status === "loading" ? (
        <p className="mt-4 text-lg text-black/70">Загружаем связи проекта с задачами из runtime...</p>
      ) : null}

      {state.status === "error" ? (
        <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-lg text-red-900">
          Не удалось прочитать список связанных задач для этого проекта.
        </p>
      ) : null}

      {state.status === "ready" && state.bindings.length === 0 ? (
        <p className="mt-4 text-lg text-black/70">
          У этого проекта пока нет задач с уже зафиксированным runtime-binding. Как только задача
          будет запущена или продолжена в этом проекте, она появится здесь.
        </p>
      ) : null}

      {state.bindings.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {state.bindings.map((binding) => (
            <article key={`${binding.projectId}:${binding.taskId}`} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
              <h3 className="text-2xl">{binding.taskTitle}</h3>
              <p className="mt-2 text-sm text-black/60">
                Источник связи: <code>{binding.source}</code>
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link className="rounded-full border border-black px-4 py-2" href={getTaskUrl(binding.taskId)}>
                  Открыть задачу
                </Link>
                <Link className="rounded-full border border-black px-4 py-2" href={getProjectUrl(binding.projectId)}>
                  Этот проект
                </Link>
              </div>
            </article>
          ))}
        </div>
      ) : null}
    </section>
  )
}

function ProjectOverviewReadyState({
  projectId,
  historyDiagnostics,
  workflowTaskCatalog,
  workflowReadout,
}: ProjectOverviewScreenProps) {
  const state = useProjectOverview(projectId)

  if (state.status === "loading") return <ProjectOverviewLoadingState />
  if (state.status === "error") return <ProjectOverviewErrorState />
  if (state.status === "missing" || !state.project) return <ProjectOverviewMissingState projectId={projectId} />

  const project = buildProjectSurfaceModel(state.project, state.project.id === state.activeProjectId)

  return (
    <main className="px-5 py-5">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="py-2 text-7xl">{project.title}</h1>
        {project.isActive ? (
          <span className="rounded-full bg-black px-3 py-1 text-sm text-white">активный проект</span>
        ) : null}
      </div>

      <p className="max-w-4xl text-xl text-black/70">
        Проект здесь работает как главная точка входа: сначала вы собираете нужные компоненты,
        потом открываете работу над ними и возвращаетесь сюда, чтобы не терять общий контекст.
      </p>

      <ProjectOverviewWorkPath />
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
        project={state.project}
        workflowTaskCatalog={workflowTaskCatalog}
        workflowReadout={workflowReadout}
      />
      <ProjectHistoryDiagnosticsPanel historyDiagnostics={historyDiagnostics} />
      <ProjectWorkflowReadoutPanel workflowReadout={workflowReadout} />
      <ProjectOverviewTaskBindings projectId={project.id} />
      <ProjectOverviewNextSteps />
    </main>
  )
}

function ProjectOverviewScreen({
  projectId,
  historyDiagnostics,
  workflowTaskCatalog,
  workflowReadout,
}: ProjectOverviewScreenProps) {
  return (
    <ProjectOverviewReadyState
      historyDiagnostics={historyDiagnostics}
      projectId={projectId}
      workflowTaskCatalog={workflowTaskCatalog}
      workflowReadout={workflowReadout}
    />
  )
}

export { ProjectOverviewScreen }
