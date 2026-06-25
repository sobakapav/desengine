"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import type { ProjectWorkspace } from "@/lib/project/runtime"
import { createBrowserProjectStorage } from "@/lib/project/storage"
import { getLabUrl } from "@/lib/lab/navigation"
import { postTaskStart } from "@/components/desengine/lab/task-client-boundary"
import { buildProjectComponentRuntimeProject } from "@/lib/task/project-runtime-scope-id"

import type { ProjectWorkflowReadoutSnapshot } from "@/lib/project/workflow-readout"
import {
  resolveProjectComponentTaskId,
  type ProjectWorkflowTaskCatalogItem,
} from "./projectComponentWorkflow"
import { useProjectComponents } from "./useProjectComponents"

type UseProjectComponentsPanelControllerArgs = {
  occupiedTaskIds: string[]
  project: ProjectWorkspace
  workflowReadout: ProjectWorkflowReadoutSnapshot
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
}

function useProjectComponentsPanelController({
  occupiedTaskIds,
  project,
  workflowTaskCatalog,
}: UseProjectComponentsPanelControllerArgs) {
  const router = useRouter()
  const state = useProjectComponents(project.id)
  const [title, setTitle] = useState("")
  const [lastCreatedComponentId, setLastCreatedComponentId] = useState<string | null>(null)
  const [createState, setCreateState] = useState<"idle" | "creating" | "created" | "error">("idle")
  const [openState, setOpenState] = useState<"idle" | "opening" | "opened" | "error">("idle")
  const [activeComponentId, setActiveComponentId] = useState<string | null>(null)
  const [message, setMessage] = useState("")

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
      const component = await state.createComponent({ title, workflowKind: "image-to-component-workflow" })
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

      const savedComponent = await state.saveComponent({ ...component, taskId: resolvedTaskId })
      const response = await postTaskStart(resolvedTaskId, runtimeProject, "component")
      const data = await response.json().catch(() => null)

      if (!response.ok || !data?.ok) {
        throw new Error(data?.error || "Не удалось открыть работу для компонента.")
      }

      await state.saveComponent({ ...savedComponent, status: "in_progress" })
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

  function handleTitleChange(value: string) {
    setTitle(value)
    setCreateState("idle")
    setOpenState("idle")
    setMessage("")
  }

  return {
    activeComponentId,
    createState,
    handleCreate,
    handleOpenWorkflow,
    handleTitleChange,
    lastCreatedComponentId,
    message,
    openState,
    state,
    title,
  }
}

export { useProjectComponentsPanelController }
