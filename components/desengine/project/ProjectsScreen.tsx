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
    <section className="mt-6 rounded-3xl border border-black/10 bg-black/[0.03] p-5">
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
      <p className="mt-6 rounded-2xl border border-red-300 bg-red-50 p-4 text-lg text-red-900">
        Не удалось прочитать локальный реестр проектов. Проверьте локальное хранилище текущего workspace.
      </p>
    )
  }

  return null
}

function ProjectsEmptyState() {
  return (
    <section className="mt-6 rounded-3xl border border-dashed border-black/20 p-6">
      <h2 className="text-3xl">Проекты пока не созданы</h2>
      <p className="mt-3 text-lg text-black/70">
        Локальный реестр пока пуст. Создайте первый проект прямо на этой странице, и он сразу
        появится в canonical списке.
      </p>
    </section>
  )
}

function CreateProjectPanel({
  createProject,
  status,
}: {
  createProject: ReturnType<typeof useProjectRegistry>["createProject"]
  status: ReturnType<typeof useProjectRegistry>["status"]
}) {
  const router = useRouter()
  const [title, setTitle] = useState("")
  const [projectId, setProjectId] = useState("")
  const [createdProjectId, setCreatedProjectId] = useState<string | null>(null)
  const [createdProjectTitle, setCreatedProjectTitle] = useState<string | null>(null)
  const [createState, setCreateState] = useState<"idle" | "creating" | "created" | "error">("idle")
  const [message, setMessage] = useState("")

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
      setTitle("")
      setProjectId("")
      setCreateState("created")
      setCreatedProjectId(project.id)
      setCreatedProjectTitle(project.title)
      setMessage(`Проект «${project.title}» создан и выбран активным. Теперь можно открыть проект и создавать в нём компоненты.`)
    } catch (error) {
      setCreateState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось создать проект.")
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-[#f8f4ea] p-6">
      <h2 className="text-3xl">Создать проект</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Это первая точка входа в работу через проекты: создайте отдельный проект, затем откройте
        его страницу и начните собирать в нём отдельные компоненты.
      </p>

      <div className="mt-5 flex flex-col gap-3 md:flex-row">
        <input
          className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base"
          placeholder="Например, Marketing site"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value)
            setCreateState("idle")
            setMessage("")
          }}
        />
        <input
          className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base"
          placeholder="Идентификатор проекта, например marketing-site"
          value={projectId}
          onChange={(event) => {
            setProjectId(event.target.value)
            setCreateState("idle")
            setMessage("")
          }}
        />
        <button
          className="rounded-full bg-black px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-black/40"
          disabled={createState === "creating" || status === "loading"}
          type="button"
          onClick={() => void handleCreate()}
        >
          {createState === "creating" ? "Создаём…" : "Создать проект"}
        </button>
      </div>

      {message ? (
        <p className={`mt-4 rounded-2xl border p-4 text-sm ${createState === "error"
          ? "border-red-300 bg-red-50 text-red-900"
          : "border-black/10 bg-white text-black/80"}`}
        >
          {message}
        </p>
        ) : null}

      {createState === "created" && createdProjectId ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="rounded-full bg-black px-5 py-3 text-sm text-white"
            type="button"
            onClick={() => router.push(getProjectUrl(createdProjectId))}
          >
            Открыть проект
          </button>
          <span className="self-center text-sm text-black/65">
            Следующий шаг: создать в проекте компонент{createdProjectTitle ? ` для «${createdProjectTitle}»` : ""}.
          </span>
        </div>
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
    <main className="px-5 py-5">
      <h1 className="py-2 text-8xl">Проекты</h1>
      <p className="max-w-4xl py-2 text-xl text-black/70">
        Здесь виден канонический реестр проектов: активный проект, доступные рабочие пространства
        и отдельная точка входа в каждый проект без захода в рабочую среду конкретной задачи.
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
