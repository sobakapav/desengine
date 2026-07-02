"use client"

import { useEffect, useState } from "react"

import { createBrowserProjectComponentStorage } from "@/lib/project/component-storage"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import {
  buildProjectHistoryDiagnosticsSnapshot,
  type ProjectHistoryDiagnosticsSnapshot,
} from "@/lib/project/history-diagnostics"
import {
  buildProjectWorkflowReadoutSnapshot,
  type ProjectWorkflowReadoutSnapshot,
} from "@/lib/project/workflow-readout"
import {
  createBrowserProjectWorkspaceStorage,
} from "@/lib/project/workspace-storage"
import {
  createProjectWorkspaceActivity,
  normalizeProjectSession,
  pickLatestActivityTimestamp,
  resolveProjectSessionStatus,
  touchProjectSession,
  type ProjectSession,
  type ProjectWorkspaceActivity,
} from "@/lib/project/workspace-session"

type ProjectWorkspaceState = {
  status: "loading" | "ready" | "error"
  components: ProjectComponent[]
  session: ProjectSession | null
  activities: ProjectWorkspaceActivity[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
}

type ProjectWorkspaceController = ProjectWorkspaceState & {
  clearFocus: () => Promise<void>
  createComponent: (title: string) => Promise<ProjectComponent>
  focusComponent: (componentId: string) => Promise<void>
  markComponentCompleted: (componentId: string) => Promise<void>
  reopenComponent: (componentId: string) => Promise<void>
  startProjectWork: () => Promise<void>
}

function buildEmptyState(projectId: string): ProjectWorkspaceState {
  return {
    status: "loading",
    components: [],
    session: null,
    activities: [],
    workflowReadout: buildProjectWorkflowReadoutSnapshot({
      projectId,
      activities: [],
      components: [],
      session: null,
    }),
    historyDiagnostics: buildProjectHistoryDiagnosticsSnapshot(projectId, [], []),
  }
}

async function readWorkspaceState(projectId: string) {
  const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
  const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)

  const [components, rawSession, activities] = await Promise.all([
    componentStorage.listComponents(projectId),
    workspaceStorage.getSession(projectId),
    workspaceStorage.listActivities(projectId),
  ])

  const activeComponent = components.find((component) => component.id === rawSession.activeComponentId) ?? null
  const completedComponentCount = components.filter((component) => component.status === "completed").length
  const syncedSession = normalizeProjectSession({
    ...rawSession,
    activeComponentId: activeComponent?.id ?? null,
    lastActivityAt: pickLatestActivityTimestamp(activities, components),
    status: resolveProjectSessionStatus({
      componentCount: components.length,
      completedComponentCount,
      activeComponentStatus: activeComponent?.status ?? null,
      storedStatus: rawSession.status,
    }),
  }, projectId)

  if (
    syncedSession.status !== rawSession.status
    || syncedSession.activeComponentId !== rawSession.activeComponentId
    || syncedSession.lastActivityAt !== rawSession.lastActivityAt
  ) {
    await workspaceStorage.saveSession({
      ...rawSession,
      ...syncedSession,
    })
  }

  return {
    components,
    session: syncedSession,
    activities,
  }
}

function useProjectWorkspace(projectId: string) {
  const [state, setState] = useState<ProjectWorkspaceState>(() => buildEmptyState(projectId))

  useEffect(() => {
    let cancelled = false

    async function load() {
      const snapshot = await readWorkspaceState(projectId)
      if (cancelled) return

      setState({
        status: "ready",
        components: snapshot.components,
        session: snapshot.session,
        activities: snapshot.activities,
        workflowReadout: buildProjectWorkflowReadoutSnapshot({
          projectId,
          activities: snapshot.activities,
          components: snapshot.components,
          session: snapshot.session,
        }),
        historyDiagnostics: buildProjectHistoryDiagnosticsSnapshot(
          projectId,
          snapshot.activities,
          snapshot.components,
        ),
      })
    }

    setState(buildEmptyState(projectId))
    load().catch(() => {
      if (!cancelled) {
        setState({
          ...buildEmptyState(projectId),
          status: "error",
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  async function refresh() {
    const snapshot = await readWorkspaceState(projectId)
    setState({
      status: "ready",
      components: snapshot.components,
      session: snapshot.session,
      activities: snapshot.activities,
      workflowReadout: buildProjectWorkflowReadoutSnapshot({
        projectId,
        activities: snapshot.activities,
        components: snapshot.components,
        session: snapshot.session,
      }),
      historyDiagnostics: buildProjectHistoryDiagnosticsSnapshot(
        projectId,
        snapshot.activities,
        snapshot.components,
      ),
    })
  }

  async function startProjectWork() {
    const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
    const session = await workspaceStorage.getSession(projectId)
    const nextSession = touchProjectSession(session, {
      status: "in_progress",
    })
    await workspaceStorage.saveSession(nextSession)
    await workspaceStorage.appendActivity(projectId, createProjectWorkspaceActivity({
      kind: "project-session-started",
      message: "Запущена работа над проектом.",
      projectId,
    }))
    await refresh()
  }

  async function createComponent(title: string) {
    const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
    const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
    const component = await componentStorage.createComponent({
      projectId,
      title,
      workflowKind: "image-to-component-workflow",
    })
    await workspaceStorage.appendActivity(projectId, createProjectWorkspaceActivity({
      kind: "project-component-created",
      message: `В проект добавлен компонент «${component.title}».`,
      projectId,
      componentId: component.id,
      componentTitle: component.title,
    }))
    await refresh()
    return component
  }

  async function focusComponent(componentId: string) {
    const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
    const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
    const [components, session] = await Promise.all([
      componentStorage.listComponents(projectId),
      workspaceStorage.getSession(projectId),
    ])
    const component = components.find((item) => item.id === componentId)
    if (!component) {
      throw new Error("Не удалось найти компонент проекта для фокуса.")
    }

    if (component.status === "draft") {
      await componentStorage.saveComponent({
        ...component,
        status: "in_progress",
      })
    }

    await workspaceStorage.saveSession(touchProjectSession(session, {
      activeComponentId: component.id,
      status: "in_progress",
    }))
    await workspaceStorage.appendActivity(projectId, createProjectWorkspaceActivity({
      kind: "project-focus-set",
      message: `Проект переведён в фокус на компонент «${component.title}».`,
      projectId,
      componentId: component.id,
      componentTitle: component.title,
    }))
    await refresh()
  }

  async function clearFocus() {
    const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
    const [session, activities] = await Promise.all([
      workspaceStorage.getSession(projectId),
      workspaceStorage.listActivities(projectId),
    ])
    const currentFocus = activities.find((activity) => activity.kind === "project-focus-set" && activity.componentTitle)?.componentTitle ?? null
    await workspaceStorage.saveSession(touchProjectSession(session, {
      activeComponentId: null,
      status: session.status === "completed" ? "completed" : "in_progress",
    }))
    await workspaceStorage.appendActivity(projectId, createProjectWorkspaceActivity({
      kind: "project-focus-cleared",
      message: currentFocus
        ? `Явный фокус проекта снят с компонента «${currentFocus}».`
        : "Явный фокус проекта снят.",
      projectId,
    }))
    await refresh()
  }

  async function markComponentCompleted(componentId: string) {
    const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
    const component = await componentStorage.getComponent(projectId, componentId)
    if (!component) {
      throw new Error("Не удалось найти компонент проекта для завершения.")
    }

    await componentStorage.saveComponent({
      ...component,
      status: "completed",
    })

    const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
    await workspaceStorage.appendActivity(projectId, createProjectWorkspaceActivity({
      kind: "project-component-completed",
      message: `Компонент «${component.title}» отмечен как готовый внутри проекта.`,
      projectId,
      componentId: component.id,
      componentTitle: component.title,
    }))
    await refresh()
  }

  async function reopenComponent(componentId: string) {
    const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
    const component = await componentStorage.getComponent(projectId, componentId)
    if (!component) {
      throw new Error("Не удалось вернуть компонент в работу проекта.")
    }

    await componentStorage.saveComponent({
      ...component,
      status: "in_progress",
    })

    const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)
    const session = await workspaceStorage.getSession(projectId)
    await workspaceStorage.saveSession(touchProjectSession(session, {
      activeComponentId: component.id,
      status: "in_progress",
    }))
    await workspaceStorage.appendActivity(projectId, createProjectWorkspaceActivity({
      kind: "project-component-reopened",
      message: `Компонент «${component.title}» возвращён в активную работу проекта.`,
      projectId,
      componentId: component.id,
      componentTitle: component.title,
    }))
    await refresh()
  }

  return {
    ...state,
    clearFocus,
    createComponent,
    focusComponent,
    markComponentCompleted,
    reopenComponent,
    startProjectWork,
  } satisfies ProjectWorkspaceController
}

export { useProjectWorkspace }

export type {
  ProjectWorkspaceController,
  ProjectWorkspaceState,
}
