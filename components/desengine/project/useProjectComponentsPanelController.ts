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
  project: ProjectWorkspace
  workflowReadout: ProjectWorkflowReadoutSnapshot
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
}

function useProjectComponentsPanelState(projectId: string) {
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
  }, [projectId])

  function resetFeedback() {
    setCreateState("idle")
    setOpenState("idle")
    setMessage("")
  }

  return {
    activeComponentId,
    createState,
    lastCreatedComponentId,
    message,
    openState,
    resetFeedback,
    setActiveComponentId,
    setCreateState,
    setLastCreatedComponentId,
    setMessage,
    setOpenState,
    setTitle,
    title,
  }
}

async function openProjectComponentWorkflow(args: {
  componentId: string
  project: ProjectWorkspace
  projectTitle: string
  push: (href: string) => void
  setActiveComponentId: (componentId: string | null) => void
  setMessage: (message: string) => void
  setOpenState: (state: "idle" | "opening" | "opened" | "error") => void
  state: ReturnType<typeof useProjectComponents>
  workflowTaskCatalog: ProjectWorkflowTaskCatalogItem[]
}) {
  const component = args.state.components.find((item) => item.id === args.componentId)

  if (!component) {
    args.setOpenState("error")
    args.setMessage("Не удалось найти выбранный компонент проекта.")
    return
  }

  const projectStorage = createBrowserProjectStorage({ storage: window.localStorage })

  try {
    await projectStorage.setActiveProjectId(args.project.id)
    const runtimeProject = buildProjectComponentRuntimeProject(args.project, component.id)
    const resolvedTaskId = resolveProjectComponentTaskId({
      component,
      projectTitle: args.projectTitle,
      workflowTaskCatalog: args.workflowTaskCatalog,
    })

    if (!resolvedTaskId) {
      args.setOpenState("error")
      args.setMessage("Для этого компонента пока не найден подходящий workflow-шаблон.")
      return
    }

    if (component.status !== "draft") {
      if (component.taskId) {
        await args.state.saveComponent({ ...component, taskId: null })
      }

      args.setOpenState("opened")
      args.setMessage(`Возвращаемся к работе над компонентом «${component.title}».`)
      args.push(getLabUrl(resolvedTaskId, null, runtimeProject))
      return
    }

    args.setActiveComponentId(args.componentId)
    args.setOpenState("opening")
    args.setMessage("")

    const response = await postTaskStart(resolvedTaskId, runtimeProject, "component")
    const data = await response.json().catch(() => null)

    if (!response.ok || !data?.ok) {
      throw new Error(data?.error || "Не удалось открыть работу для компонента.")
    }

    await args.state.saveComponent({ ...component, taskId: null, status: "in_progress" })
    args.setMessage(`Открываем работу над компонентом «${component.title}».`)
    args.setOpenState("opened")
    args.push(getLabUrl(resolvedTaskId, null, runtimeProject))
  } catch (error) {
    args.setOpenState("error")
    args.setMessage(error instanceof Error ? error.message : "Не удалось открыть работу над компонентом.")
  } finally {
    args.setActiveComponentId(null)
  }
}

function useProjectComponentsPanelController({
  project,
  workflowTaskCatalog,
}: UseProjectComponentsPanelControllerArgs) {
  const router = useRouter()
  const state = useProjectComponents(project.id)
  const panelState = useProjectComponentsPanelState(project.id)

  async function handleCreate() {
    if (!panelState.title.trim()) {
      panelState.setCreateState("error")
      panelState.setMessage("Введите имя компонента, чтобы добавить новую рабочую часть в проект.")
      return
    }

    panelState.setCreateState("creating")
    panelState.setMessage("")
    panelState.setLastCreatedComponentId(null)

    try {
      const component = await state.createComponent({ title: panelState.title, workflowKind: "image-to-component-workflow" })
      panelState.setTitle("")
      panelState.setLastCreatedComponentId(component.id)
      panelState.setCreateState("created")
      panelState.setOpenState("idle")
      panelState.setMessage(`Компонент «${component.title}» создан. Теперь можно сразу открыть работу над ним или добавить следующий компонент.`)
    } catch (error) {
      panelState.setCreateState("error")
      panelState.setOpenState("idle")
      panelState.setMessage(error instanceof Error ? error.message : "Не удалось создать компонент проекта.")
    }
  }

  async function handleOpenWorkflow(componentId: string) {
    await openProjectComponentWorkflow({
      componentId,
      project,
      projectTitle: project.title,
      push: router.push,
      setActiveComponentId: panelState.setActiveComponentId,
      setMessage: panelState.setMessage,
      setOpenState: panelState.setOpenState,
      state,
      workflowTaskCatalog,
    })
  }

  function handleTitleChange(value: string) {
    panelState.setTitle(value)
    panelState.resetFeedback()
  }

  return {
    activeComponentId: panelState.activeComponentId,
    createState: panelState.createState,
    handleCreate,
    handleOpenWorkflow,
    handleTitleChange,
    lastCreatedComponentId: panelState.lastCreatedComponentId,
    message: panelState.message,
    openState: panelState.openState,
    state,
    title: panelState.title,
  }
}

export { useProjectComponentsPanelController }
