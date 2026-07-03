"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { ProjectCard } from "@/components/desengine/project/ProjectCard"
import { getProjectUrl } from "@/lib/project/navigation"

import {
  buildProjectSurfaceModel,
  sortProjectsForSurface,
} from "./projectSurface"
import { PROJECT_STORAGE_LABEL } from "./projectStorageLabels"
import { useProjectRegistry } from "./useProjectRegistry"

function ProjectsSummary({
  projectCount,
  activeProjectId,
}: {
  projectCount: number
  activeProjectId: string | null
}) {
  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <p className="text-lg">
        Всего проектов: <strong>{projectCount}</strong>
      </p>
      <p className="text-base text-black/70">
        Активный проект: <strong>{activeProjectId ?? "ещё не выбран"}</strong>
      </p>
      <p className="mt-2 text-base text-black/70">
        Хранение: <strong>{PROJECT_STORAGE_LABEL}</strong> — проект пока хранится локально в браузере.
      </p>
    </section>
  )
}

function ProjectsStateNotice({ status }: { status: "loading" | "ready" | "error" }) {
  if (status === "loading") {
    return <p className="mt-6 text-lg">Загружаем реестр проектов...</p>
  }

  if (status === "error") {
    return (
      <p className="shell-callout mt-6 border border-dashed border-black bg-white p-4 text-lg">
        Не удалось прочитать локальный реестр проектов. Проверьте локальное хранилище текущего workspace.
      </p>
    )
  }

  return null
}

function ProjectsEmptyState() {
  return (
    <section className="shell-callout mt-6 border border-dashed border-black bg-white p-6">
      <h2 className="text-3xl">Проекты пока не созданы</h2>
      <p className="mt-3 text-lg text-black/70">
        Локальный реестр пока пуст. Создайте первый проект прямо на этой странице, и он сразу
        появится в canonical списке.
      </p>
    </section>
  )
}

function CreatedProjectActions({
  createdProjectId,
  createdProjectTitle,
}: {
  createdProjectId: string
  createdProjectTitle: string | null
}) {
  const router = useRouter()

  return (
    <div className="mt-4 flex flex-wrap gap-3">
      <button
        className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white"
        type="button"
        onClick={() => router.push(getProjectUrl(createdProjectId))}
      >
        Открыть проект
      </button>
      <span className="self-center text-sm text-black/65">
        Следующий шаг: создать в проекте компонент{createdProjectTitle ? ` для «${createdProjectTitle}»` : ""}.
      </span>
    </div>
  )
}

function CreateProjectFeedback({
  createState,
  message,
}: {
  createState: "idle" | "creating" | "created" | "error"
  message: string
}) {
  if (!message) return null

  return (
    <p className="shell-callout mt-4 border border-dashed border-black bg-white p-4 text-sm">
      {message}
    </p>
  )
}

function useCreateProjectPanelState(createProject: ReturnType<typeof useProjectRegistry>["createProject"]) {
  const [title, setTitleValue] = useState("")
  const [projectId, setProjectIdValue] = useState("")
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [createdProjectTitle, setCreatedProjectTitle] = useState<string | null>(null)
  const [createState, setCreateState] = useState<"idle" | "creating" | "created" | "error">("idle")
  const [message, setMessage] = useState("")

  function resetDraftState() {
    setCreateState("idle")
    setMessage("")
  }

  function setTitle(value: string) {
    setTitleValue(value)
    resetDraftState()
  }

  function setProjectId(value: string) {
    setProjectIdValue(value)
    resetDraftState()
  }

  async function handleCreate() {
    if (!title.trim()) {
      setCreateState("error")
      setMessage("Введите имя проекта, чтобы создать новый рабочий контейнер.")
      return
    }

    setCreateState("creating")
    setMessage("")
    setCreatedProjectId(null)
    setCreatedProjectTitle(null)

    try {
      const project = await createProject({
        id: projectId.trim() || undefined,
        title,
      })
      setTitleValue("")
      setProjectIdValue("")
      setCreateState("created")
      setCreatedProjectId(project.id)
      setCreatedProjectTitle(project.title)
      setMessage(`Проект «${project.title}» создан и выбран активным. Теперь можно открыть проект и создавать в нём компоненты.`)
    } catch (error) {
      setCreateState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось создать проект.")
    }
  }

  return {
    createState,
    createdProjectId,
    createdProjectTitle,
    handleCreate,
    message,
    projectId,
    setProjectId,
    setTitle,
    title,
  }
}

function CreateProjectPanel({
  createProject,
  status,
}: {
  createProject: ReturnType<typeof useProjectRegistry>["createProject"]
  status: ReturnType<typeof useProjectRegistry>["status"]
}) {
  const {
    createState,
    createdProjectId,
    createdProjectTitle,
    handleCreate,
    message,
    projectId,
    setProjectId,
    setTitle,
    title,
  } = useCreateProjectPanelState(createProject)

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <h2 className="shell-subtitle mt-0 text-3xl">Создать проект</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Это первая точка входа в работу через проекты: создайте отдельный проект, затем откройте
        его страницу и начните собирать в нём отдельные компоненты.
      </p>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <input
          className="shell-field w-full border border-black bg-white px-4 py-3"
          placeholder="Например, Marketing site"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="shell-field w-full border border-black bg-white px-4 py-3"
          placeholder="Идентификатор проекта, например marketing-site"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        />
        <button
          className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-45"
          disabled={createState === "creating" || status === "loading"}
          type="button"
          onClick={() => void handleCreate()}
        >
          {createState === "creating" ? "Создаём…" : "Создать проект"}
        </button>
      </div>

      <CreateProjectFeedback createState={createState} message={message} />

      {createState === "created" && createdProjectId ? (
        <CreatedProjectActions
          createdProjectId={createdProjectId}
          createdProjectTitle={createdProjectTitle}
        />
      ) : null}
    </section>
  )
}

function ProjectsGrid({
  projects,
  activeProjectId,
  status,
}: {
  projects: ReturnType<typeof sortProjectsForSurface>
  activeProjectId: string | null
  status: "loading" | "ready" | "error"
}) {
  const orderedProjects = sortProjectsForSurface(projects, activeProjectId)

  if (status === "ready" && orderedProjects.length === 0) {
    return <ProjectsEmptyState />
  }

  if (orderedProjects.length === 0) {
    return null
  }

  return (
    <section className="mt-6 grid gap-4 md:grid-cols-2">
      {orderedProjects.map((project) => (
        <ProjectCard
          key={project.id}
          project={buildProjectSurfaceModel(project, project.id === activeProjectId)}
        />
      ))}
    </section>
  )
}

function ProjectsScreen() {
  const state = useProjectRegistry()

  return (
    <main className="shell-page px-6 py-6">
      <p className="shell-eyebrow text-xs uppercase tracking-[0.22em]">Project registry</p>
      <h1 className="shell-title py-2 text-[clamp(3.25rem,6vw,6.25rem)]">Проекты</h1>
      <p className="shell-lead py-2 max-w-4xl text-[1.55rem] leading-[1.35] text-black/72">
        Здесь виден канонический реестр проектов: активный проект, доступные рабочие пространства
        и отдельная точка входа в каждый проект без обходных legacy-сценариев.
      </p>

      <ProjectsSummary
        activeProjectId={state.activeProjectId}
        projectCount={state.projects.length}
      />
      <CreateProjectPanel createProject={state.createProject} status={state.status} />
      <ProjectsStateNotice status={state.status} />
      <ProjectsGrid
        activeProjectId={state.activeProjectId}
        projects={state.projects}
        status={state.status}
      />
    </main>
  )
}

export { ProjectsScreen }
