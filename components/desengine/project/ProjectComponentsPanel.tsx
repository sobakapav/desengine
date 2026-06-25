"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import { createBrowserProjectStorage } from "@/lib/project/storage"
import { getLabUrl } from "@/lib/lab/navigation"
import { getTaskUrl } from "@/lib/task/navigation"
import { postTaskStart } from "@/components/desengine/lab/task-client-boundary"
import { buildProjectComponentRuntimeProject } from "@/lib/task/project-runtime-scope-id"

import {
  resolveProjectComponentTaskId,
  resolveProjectWorkflowTaskTitle,
  type ProjectWorkflowTaskCatalogItem,
} from "./projectComponentWorkflow"
import { buildProjectComponentSurfaceModel } from "./projectSurface"
import { useProjectComponents } from "./useProjectComponents"

const START_COMPONENT_WORK_LABEL = "Работать над компонентом"
const RESUME_COMPONENT_WORK_LABEL = "Продолжить работу"

type ProjectComponentsPanelProps = {
  occupiedTaskIds: string[]
  project: ProjectWorkspace
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
}

function buildProjectComponentCounters(components: ReturnType<typeof useProjectComponents>["components"]) {
  return {
    total: components.length,
    draft: components.filter((component) => component.status === "draft").length,
    inProgress: components.filter((component) => component.status === "in_progress").length,
    completed: components.filter((component) => component.status === "completed").length,
  }
}

function ProjectComponentsPanel({
  occupiedTaskIds,
  project,
  workflowTaskCatalog,
  workflowReadout,
}: ProjectComponentsPanelProps) {
  const router = useRouter()
  const state = useProjectComponents(project.id)
  const [title, setTitle] = useState("")
  const [lastCreatedComponentId, setLastCreatedComponentId] = useState<string | null>(null)
  const [createState, setCreateState] = useState<"idle" | "creating" | "created" | "error">("idle")
  const [openState, setOpenState] = useState<"idle" | "opening" | "opened" | "error">("idle")
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const counters = buildProjectComponentCounters(state.components)

  useEffect(() => {
    setCreateState("idle")
    setOpenState("idle")
    setMessage("")
    setTitle("")
    setActiveComponentId(null)
    setLastCreatedComponentId(null)
  }, [project.id])

  async function handleCreate() {
    if (!title.trim()) {
      setCreateState("error")
      setMessage("Введите имя компонента, чтобы добавить новую рабочую часть в проект.")
      return
    }

    setCreateState("creating")
    setMessage("")
    setLastCreatedComponentId(null)

    try {
      const component = await state.createComponent({
        title,
        workflowKind: "image-to-component-workflow",
      })
      setTitle("")
      setLastCreatedComponentId(component.id)
      setCreateState("created")
      setOpenState("idle")
      setMessage(`Компонент «${component.title}» создан. Теперь можно сразу открыть работу над ним или добавить следующий компонент.`)
    } catch (error) {
      setCreateState("error")
      setOpenState("idle")
      setMessage(error instanceof Error ? error.message : "Не удалось создать компонент проекта.")
    }
  }

  async function handleOpenWorkflow(componentId: string) {
    const component = state.components.find((item) => item.id === componentId)

    if (!component) {
      setOpenState("error")
      setMessage("Не удалось найти выбранный компонент проекта.")
      return
    }

    const projectStorage = createBrowserProjectStorage({ storage: window.localStorage })

    try {
      await projectStorage.setActiveProjectId(project.id)

      const runtimeProject = buildProjectComponentRuntimeProject(project, component.id)

      if (component.taskId && component.status !== "draft") {
        setOpenState("opened")
        setMessage(`Возвращаемся к работе над компонентом «${component.title}».`)
        router.push(getLabUrl(component.taskId, null, runtimeProject))
        return
      }

      const resolvedTaskId = resolveProjectComponentTaskId({
        component,
        components: state.components,
        occupiedTaskIds,
        workflowTaskCatalog,
      })

      if (!resolvedTaskId) {
        setOpenState("error")
        setMessage("Для этого workflow пока не найден базовый runtime-шаблон.")
        return
      }

      setActiveComponentId(componentId)
      setOpenState("opening")
      setMessage("")

      const savedComponent = await state.saveComponent({
        ...component,
        taskId: resolvedTaskId,
      })

      const response = await postTaskStart(resolvedTaskId, runtimeProject, "component")
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Не удалось открыть работу для компонента.")
      }

      await state.saveComponent({
        ...savedComponent,
        status: "in_progress",
      })

      setMessage(`Открываем работу над компонентом «${component.title}».`)
      setOpenState("opened")
      router.push(getLabUrl(resolvedTaskId, null, runtimeProject))
    } catch (error) {
      setOpenState("error")
      setMessage(error instanceof Error ? error.message : "Не удалось открыть работу над компонентом.")
    } finally {
      setActiveComponentId(null)
    }
  }

  return (
    <section className="mt-6 rounded-3xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-3xl">Компоненты проекта</h2>
          <p className="mt-2 max-w-4xl text-lg text-black/70">
            Компоненты помогают разложить проект на отдельные рабочие части. Для каждой такой части
            можно открыть свою работу и потом вернуться к ней из этого же проекта.
          </p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-4">
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Всего компонентов</p>
          <p className="mt-2 text-2xl">{counters.total}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Черновики</p>
          <p className="mt-2 text-2xl">{counters.draft}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">В работе</p>
          <p className="mt-2 text-2xl">{counters.inProgress}</p>
        </article>
        <article className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
          <p className="text-sm uppercase tracking-wide text-black/50">Готовы</p>
          <p className="mt-2 text-2xl">{counters.completed}</p>
        </article>
      </div>

      <div className="mt-5 rounded-3xl border border-black/10 bg-[#f8f4ea] p-5">
        <h3 className="text-2xl">Создать новый компонент</h3>
        <p className="mt-2 text-base text-black/70">
          Создание компонента только добавляет новую рабочую часть в проект. Сама работа начнётся
          позже, когда вы нажмёте `Работать над компонентом`.
        </p>

        <div className="mt-4 flex flex-col gap-3 md:flex-row">
          <input
            className="w-full rounded-2xl border border-black/15 bg-white px-4 py-3 text-base"
            placeholder="Например, Product card"
            value={title}
            onChange={(event) => {
              setTitle(event.target.value)
              setCreateState("idle")
              setOpenState("idle")
              setMessage("")
            }}
          />
          <button
            className="rounded-full bg-black px-5 py-3 text-sm text-white disabled:cursor-not-allowed disabled:bg-black/40"
            disabled={createState === "creating"}
            type="button"
            onClick={() => void handleCreate()}
          >
            {createState === "creating" ? "Создаём…" : "Создать компонент"}
          </button>
        </div>

        {message ? (
          <p className={`mt-4 rounded-2xl border p-4 text-sm ${createState === "error"
            || openState === "error"
            ? "border-red-300 bg-red-50 text-red-900"
            : "border-black/10 bg-white text-black/80"}`}
          >
            {message}
          </p>
        ) : null}

        {createState === "created" && lastCreatedComponentId ? (
          <div className="mt-4 flex flex-wrap gap-3">
            <button
              className="rounded-full bg-black px-4 py-2 text-sm text-white"
              type="button"
              onClick={() => void handleOpenWorkflow(lastCreatedComponentId)}
            >
              Работать над новым компонентом
            </button>
            <span className="self-center text-sm text-black/65">
              Или оставьте компонент в списке и создайте следующий.
            </span>
          </div>
        ) : null}
      </div>

      {state.status === "loading" ? (
        <p className="mt-4 text-lg text-black/70">Загружаем project-scoped registry компонентов...</p>
      ) : null}

      {state.status === "error" ? (
        <p className="mt-4 rounded-2xl border border-red-300 bg-red-50 p-4 text-lg text-red-900">
          Не удалось прочитать registry компонентов этого проекта.
        </p>
      ) : null}

      {state.status === "ready" && state.components.length === 0 ? (
        <p className="mt-4 text-lg text-black/70">
          В этом проекте ещё нет компонентов. Создайте первый компонент, чтобы перейти от проекта
          к реальной работе.
        </p>
      ) : null}

      {state.components.length > 0 ? (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {state.components.map((component) => {
            const workflowEntry = component.taskId
              ? workflowReadout.entries.find((entry) => entry.taskId === component.taskId) ?? null
              : null
            const model = buildProjectComponentSurfaceModel(component, {
              taskLabel: resolveProjectWorkflowTaskTitle(component.taskId, workflowTaskCatalog),
              workflowEntry,
            })
            const sessionActionLabel = model.sessionActionLabel === RESUME_COMPONENT_WORK_LABEL
              ? RESUME_COMPONENT_WORK_LABEL
              : START_COMPONENT_WORK_LABEL

            return (
              <article key={model.id} className="rounded-2xl border border-black/10 bg-black/[0.02] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h3 className="text-2xl">{model.title}</h3>
                  <span className="rounded-full border border-black/10 px-3 py-1 text-sm">
                    {model.statusLabel}
                  </span>
                </div>
                <p className="mt-2 text-sm text-black/60">
                  <code>{model.id}</code>
                </p>
                <dl className="mt-4 grid gap-2 text-base">
                  <div>
                    <dt className="text-black/60">Рабочая задача</dt>
                    <dd>{model.taskLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Тип работы</dt>
                    <dd>{model.workflowLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Состояние работы</dt>
                    <dd>{model.sessionStatusLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Последняя активность</dt>
                    <dd>{model.lastActivityLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Прогресс работы</dt>
                    <dd>{model.workflowProgressLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Текущий шаг</dt>
                    <dd>{model.activeWorkflowPointLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Создан</dt>
                    <dd>{model.createdAtLabel}</dd>
                  </div>
                  <div>
                    <dt className="text-black/60">Обновлён</dt>
                    <dd>{model.updatedAtLabel}</dd>
                  </div>
                </dl>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    className="rounded-full bg-black px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:bg-black/40"
                    disabled={openState === "opening" && activeComponentId === component.id}
                    type="button"
                    onClick={() => void handleOpenWorkflow(component.id)}
                  >
                    {openState === "opening" && activeComponentId === component.id
                      ? "Открываем…"
                      : sessionActionLabel}
                  </button>
                  {component.taskId ? (
                    <Link
                      className="rounded-full border border-black px-4 py-2 text-sm"
                      href={getTaskUrl(component.taskId)}
                    >
                      Открыть задачу
                    </Link>
                  ) : null}
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export { ProjectComponentsPanel }
