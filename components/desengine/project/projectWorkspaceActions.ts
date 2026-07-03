"use client"

import { createBrowserProjectComponentStorage } from "@/lib/project/component-storage"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import {
  createBrowserProjectWorkspaceStorage,
} from "@/lib/project/workspace-storage"
import {
  createProjectWorkspaceActivity,
  touchProjectSession,
} from "@/lib/project/workspace-session"

type ProjectWorkspaceActionContext = {
  projectId: string
  refresh: () => Promise<void>
}

async function performProjectWorkStart(args: ProjectWorkspaceActionContext) {
  const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
  const session = await workspaceStorage.getSession(args.projectId)
  const nextSession = touchProjectSession(session, {
    status: "in_progress",
  })

  await workspaceStorage.saveSession(nextSession)
  await workspaceStorage.appendActivity(args.projectId, createProjectWorkspaceActivity({
    kind: "project-session-started",
    message: "Запущена работа над проектом.",
    projectId: args.projectId,
  }))
  await args.refresh()
}

async function performProjectComponentCreate(
  args: ProjectWorkspaceActionContext,
  title: string,
) {
  const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
  const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
  const component = await componentStorage.createComponent({
    projectId: args.projectId,
    title,
    workflowKind: "image-to-component-workflow",
  })

  await workspaceStorage.appendActivity(args.projectId, createProjectWorkspaceActivity({
    kind: "project-component-created",
    message: `В проект добавлен компонент «${component.title}».`,
    projectId: args.projectId,
    componentId: component.id,
    componentTitle: component.title,
  }))
  await args.refresh()

  return component
}

async function performProjectComponentStart(
  args: ProjectWorkspaceActionContext,
  componentId: string,
) {
  const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
  const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
  const [components, session] = await Promise.all([
    componentStorage.listComponents(args.projectId),
    workspaceStorage.getSession(args.projectId),
  ])
  const component = components.find((item) => item.id === componentId)

  if (!component) {
    throw new Error("Не удалось найти компонент проекта для запуска линии работы.")
  }

  if (component.status !== "in_progress") {
    await componentStorage.saveComponent({ ...component, status: "in_progress" })
  }

  await workspaceStorage.saveSession(touchProjectSession(session, {
    status: "in_progress",
  }))
  await workspaceStorage.appendActivity(args.projectId, createProjectWorkspaceActivity({
    kind: "project-component-started",
    message: `По компоненту «${component.title}» запущена активная линия работы проекта.`,
    projectId: args.projectId,
    componentId: component.id,
    componentTitle: component.title,
  }))
  await args.refresh()
}

async function updateComponentStatus(args: {
  componentId: string
  errorMessage: string
  message: (title: string) => string
  nextStatus: "completed" | "in_progress"
  nextSessionStatus?: "in_progress"
  projectId: string
  refresh: () => Promise<void>
}) {
  const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
  const component = await componentStorage.getComponent(args.projectId, args.componentId)

  if (!component) {
    throw new Error(args.errorMessage)
  }

  await componentStorage.saveComponent({
    ...component,
    status: args.nextStatus,
  })

  const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
  if (args.nextSessionStatus) {
    const session = await workspaceStorage.getSession(args.projectId)
    await workspaceStorage.saveSession(touchProjectSession(session, {
      status: args.nextSessionStatus,
    }))
  }

  await workspaceStorage.appendActivity(args.projectId, createProjectWorkspaceActivity({
    kind: args.nextStatus === "completed"
      ? "project-component-completed"
      : "project-component-reopened",
    message: args.message(component.title),
    projectId: args.projectId,
    componentId: component.id,
    componentTitle: component.title,
  }))
  await args.refresh()
}

function createProjectWorkspaceActions(args: ProjectWorkspaceActionContext) {
  async function startProjectWork() {
    await performProjectWorkStart(args)
  }

  async function createComponent(title: string) {
    return performProjectComponentCreate(args, title)
  }

  async function startComponentWork(componentId: string) {
    await performProjectComponentStart(args, componentId)
  }

  async function markComponentCompleted(componentId: string) {
    await updateComponentStatus({
      componentId,
      errorMessage: "Не удалось найти компонент проекта для завершения.",
      message: (title) => `Компонент «${title}» отмечен как готовый внутри проекта.`,
      nextStatus: "completed",
      projectId: args.projectId,
      refresh: args.refresh,
    })
  }

  async function reopenComponent(componentId: string) {
    await updateComponentStatus({
      componentId,
      errorMessage: "Не удалось вернуть компонент в работу проекта.",
      message: (title) => `Компонент «${title}» возвращён в активную работу проекта.`,
      nextStatus: "in_progress",
      nextSessionStatus: "in_progress",
      projectId: args.projectId,
      refresh: args.refresh,
    })
  }

  return {
    createComponent,
    markComponentCompleted,
    reopenComponent,
    startComponentWork,
    startProjectWork,
  } satisfies {
    createComponent: (title: string) => Promise<ProjectComponent>
    markComponentCompleted: (componentId: string) => Promise<void>
    reopenComponent: (componentId: string) => Promise<void>
    startComponentWork: (componentId: string) => Promise<void>
    startProjectWork: () => Promise<void>
  }
}

export { createProjectWorkspaceActions }
