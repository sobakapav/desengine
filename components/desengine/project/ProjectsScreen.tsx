"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

import { ProjectCard } from "@/components/desengine/project/ProjectCard"
import { getProjectUrl } from "@/lib/project/navigation"

import {
  buildProjectSurfaceModel,
  listProjectUiKitOptions,
  sortProjectsForSurface,
} from "./projectSurface"
import { PROJECT_STORAGE_LABEL } from "./projectStorageLabels"
import { useProjectRegistry } from "./useProjectRegistry"

function ProjectsSummary({
  archiveFileCount,
  projectCount,
  figmaFileCount,
  activeProjectId,
}: {
  archiveFileCount: number
  projectCount: number
  figmaFileCount: number
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
        Хранение: <strong>{PROJECT_STORAGE_LABEL}</strong> — canonical project state хранится на диске машины сервера, а не в браузере.
      </p>
      <p className="mt-2 text-base text-black/70">
        Видимые источники: <strong>{figmaFileCount}</strong> Figma-файл(ов) и <strong>{archiveFileCount}</strong> файл(ов) архива в текущем registry.
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
        Не удалось прочитать disk-backed реестр проектов. Проверьте server path и файловый доступ.
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
        Реестр проектов пока пуст. Создайте первый проект с явным server path или подключите уже
        существующий проект с диска.
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
  const [code, setCodeValue] = useState("")
  const [projectId, setProjectIdValue] = useState("")
  const [rootPath, setRootPathValue] = useState("")
  const [uiKitId, setUiKitIdValue] = useState("ant")
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

  function setCode(value: string) {
    setCodeValue(value)
    resetDraftState()
  }

  function setProjectId(value: string) {
    setProjectIdValue(value)
    resetDraftState()
  }

  function setRootPath(value: string) {
    setRootPathValue(value)
    resetDraftState()
  }

  function setUiKitId(value: string) {
    setUiKitIdValue(value)
    resetDraftState()
  }

  async function handleCreate() {
    if (!title.trim()) {
      setCreateState("error")
      setMessage("Введите имя проекта, чтобы создать новый рабочий контейнер.")
      return
    }

    if (!rootPath.trim()) {
      setCreateState("error")
      setMessage("Укажите абсолютный server path, где должен храниться проект.")
      return
    }

    if (!code.trim()) {
      setCreateState("error")
      setMessage("Укажите короткий код проекта. Он хранится отдельно от технического id.")
      return
    }

    setCreateState("creating")
    setMessage("")
    setCreatedProjectId(null)
    setCreatedProjectTitle(null)

    try {
      const project = await createProject({
        code,
        id: projectId.trim() || undefined,
        rootPath,
        title,
        uiKitId,
      })
      setTitleValue("")
      setCodeValue("")
      setProjectIdValue("")
      setRootPathValue("")
      setUiKitIdValue("ant")
      setCreateState("created")
      setCreatedProjectId(project.id)
      setCreatedProjectTitle(project.title)
      setMessage(`Проект «${project.title}» создан на диске сервера и выбран активным. Теперь можно открыть проект и создавать в нём компоненты.`)
    } catch (error) {
      setCreateState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось создать проект.")
    }
  }

  return {
    code,
    createState,
    createdProjectId,
    createdProjectTitle,
    handleCreate,
    message,
    projectId,
    rootPath,
    setCode,
    setProjectId,
    setRootPath,
    setTitle,
    setUiKitId,
    title,
    uiKitId,
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
    code,
    createState,
    createdProjectId,
    createdProjectTitle,
    handleCreate,
    message,
    projectId,
    rootPath,
    setCode,
    setProjectId,
    setRootPath,
    setTitle,
    setUiKitId,
    title,
    uiKitId,
  } = useCreateProjectPanelState(createProject)
  const uiKitOptions = listProjectUiKitOptions()

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <h2 className="shell-subtitle mt-0 text-3xl">Создать проект</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Создайте отдельный проект и сразу укажите, где именно он будет жить на машине сервера.
        После создания этот путь станет canonical storage для проекта и его autosave-состояния.
      </p>

      <div className="mt-5 grid gap-3">
        <input
          className="shell-field w-full border border-black bg-white px-4 py-3"
          placeholder="Например, Marketing site"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <input
          className="shell-field w-full border border-black bg-white px-4 py-3"
          placeholder="Код проекта, например marketing-site"
          value={code}
          onChange={(event) => setCode(event.target.value)}
        />
        <input
          className="shell-field w-full border border-black bg-white px-4 py-3"
          placeholder="Технический id проекта, если нужен отдельно"
          value={projectId}
          onChange={(event) => setProjectId(event.target.value)}
        />
        <select
          className="shell-field w-full border border-black bg-white px-4 py-3"
          value={uiKitId}
          onChange={(event) => setUiKitId(event.target.value)}
        >
          {uiKitOptions.map((kit) => (
            <option key={kit.id} value={kit.id}>
              {kit.title} ({kit.id})
            </option>
          ))}
        </select>
        <input
          className="shell-field w-full border border-black bg-white px-4 py-3 font-mono"
          placeholder="/srv/desengine/projects/marketing-site"
          value={rootPath}
          onChange={(event) => setRootPath(event.target.value)}
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

function ConnectProjectPanel({
  connectProject,
  status,
}: {
  connectProject: ReturnType<typeof useProjectRegistry>["connectProject"]
  status: ReturnType<typeof useProjectRegistry>["status"]
}) {
  const [rootPath, setRootPath] = useState("")
  const [message, setMessage] = useState("")
  const [connectState, setConnectState] = useState<"idle" | "connecting" | "connected" | "error">("idle")
  const [connectedProjectId, setConnectedProjectId] = useState<string | null>(null)
  const router = useRouter()

  async function handleConnect() {
    if (!rootPath.trim()) {
      setConnectState("error")
      setMessage("Укажите абсолютный server path существующего проекта.")
      return
    }

    setConnectState("connecting")
    setMessage("")
    setConnectedProjectId(null)

    try {
      const project = await connectProject(rootPath)
      setConnectState("connected")
      setMessage(`Проект «${project.title}» подключён с диска и добавлен в canonical registry.`)
      setConnectedProjectId(project.id)
      setRootPath("")
    } catch (error) {
      setConnectState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось подключить проект.")
    }
  }

  return (
    <section className="shell-section mt-6 border border-black bg-white p-6">
      <h2 className="shell-subtitle mt-0 text-3xl">Подключить проект с диска</h2>
      <p className="mt-3 max-w-4xl text-lg text-black/70">
        Если проект уже лежит на машине сервера, укажите его корневой путь. Система прочитает
        `project.json`, подключит его к registry и откроет как обычный project surface.
      </p>

      <div className="mt-5 grid gap-3">
        <input
          className="shell-field w-full border border-black bg-white px-4 py-3 font-mono"
          placeholder="/srv/desengine/projects/external-project"
          value={rootPath}
          onChange={(event) => {
            setRootPath(event.target.value)
            setConnectState("idle")
            setMessage("")
          }}
        />
        <button
          className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white disabled:cursor-not-allowed disabled:opacity-45"
          disabled={connectState === "connecting" || status === "loading"}
          type="button"
          onClick={() => void handleConnect()}
        >
          {connectState === "connecting" ? "Подключаем…" : "Подключить проект"}
        </button>
      </div>

      <CreateProjectFeedback createState={connectState === "error" ? "error" : "idle"} message={message} />

      {connectState === "connected" && connectedProjectId ? (
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            className="shell-button inline-flex items-center border border-black bg-black px-5 py-3 text-white"
            type="button"
            onClick={() => router.push(getProjectUrl(connectedProjectId))}
          >
            Открыть проект
          </button>
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
      {orderedProjects.map((entry) => (
        <ProjectCard
          key={entry.project.id}
          project={buildProjectSurfaceModel(
            entry.project,
            entry.project.id === activeProjectId,
            entry.rootPath,
            entry.surface,
          )}
        />
      ))}
    </section>
  )
}

function ProjectsScreen() {
  const state = useProjectRegistry()
  const figmaFileCount = state.projects.reduce((sum, item) => sum + (item.surface?.figmaFiles.length ?? 0), 0)
  const archiveFileCount = state.projects.reduce(
    (sum, item) => sum + (item.surface?.archiveGroups.reduce((groupSum, group) => groupSum + group.fileCount, 0) ?? 0),
    0,
  )

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
        archiveFileCount={archiveFileCount}
        figmaFileCount={figmaFileCount}
        projectCount={state.projects.length}
      />
      <CreateProjectPanel createProject={state.createProject} status={state.status} />
      <ConnectProjectPanel connectProject={state.connectProject} status={state.status} />
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
