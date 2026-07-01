"use client"

import { useEffect, useState } from "react"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import { createBrowserProjectComponentStorage } from "@/lib/project/component-storage"
import { createBrowserProjectStorage } from "@/lib/project/storage"
import { readProjectFromTaskUrl } from "@/components/desengine/lab/task-client-boundary"
import { parseProjectComponentRuntimeId } from "@/lib/task/project-runtime-scope-id"

type TaskProjectComponentState = {
  status: "loading" | "ready" | "error"
  component: ProjectComponent | null
  projectId: string | null
}

/**
 * @example
 * ```ts
 * const component = findProjectComponentByTaskId(components, "task-1", "component-1")
 * ```
 */
function findProjectComponentByTaskId(components: ProjectComponent[], taskId: string, componentId?: string | null) {
  if (componentId) {
    return components.find((component) => component.id === componentId) ?? null
  }

  return components.find((component) => component.taskId === taskId) ?? null
}

/**
 * @example
 * ```tsx
 * const state = useTaskProjectComponent("task-1", "project-1")
 * ```
 */
function useTaskProjectComponent(taskId: string, preferredProjectId?: string | null, preferredComponentId?: string | null) {
  const [state, setState] = useState<TaskProjectComponentState>({
    status: "loading",
    component: null,
    projectId: null,
  })

  useEffect(() => {
    let cancelled = false

    async function loadComponent() {
      const projectStorage = createBrowserProjectStorage({ storage: window.localStorage })
      const urlProject = readProjectFromTaskUrl(taskId)
      const urlRuntimeScope = urlProject ? parseProjectComponentRuntimeId(urlProject.id) : null
      const projectId = preferredProjectId?.trim() || urlRuntimeScope?.projectId || await projectStorage.getActiveProjectId()
      const componentId = preferredComponentId?.trim() || urlRuntimeScope?.componentId || null

      if (!projectId) {
        if (!cancelled) {
          setState({
            status: "ready",
            component: null,
            projectId: null,
          })
        }
        return
      }

      const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
      const components = await componentStorage.listComponents(projectId)
      const component = findProjectComponentByTaskId(components, taskId, componentId)

      if (!cancelled) {
        setState({
          status: "ready",
          component,
          projectId,
        })
      }
    }

    loadComponent().catch(() => {
      if (!cancelled) {
        setState({
          status: "error",
          component: null,
          projectId: preferredProjectId?.trim() || null,
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [preferredComponentId, preferredProjectId, taskId])

  return state
}

export {
  findProjectComponentByTaskId,
  useTaskProjectComponent,
}

export type { TaskProjectComponentState }
