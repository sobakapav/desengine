"use client"

import { useEffect, useState } from "react"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import { createBrowserProjectComponentStorage } from "@/lib/project/component-storage"
import { createBrowserProjectStorage } from "@/lib/project/storage"

type ProjectComponentContextState = {
  status: "loading" | "ready" | "error"
  component: ProjectComponent | null
  projectId: string | null
}

/**
 * @example
 * ```ts
 * const component = findProjectComponentById(components, "component-1")
 * ```
 */
function findProjectComponentById(components: ProjectComponent[], componentId?: string | null) {
  if (componentId) {
    return components.find((component) => component.id === componentId) ?? null
  }

  return null
}

/**
 * @example
 * ```tsx
 * const state = useProjectComponent("project-1", "component-1")
 * ```
 */
function useProjectComponent(preferredProjectId?: string | null, preferredComponentId?: string | null) {
  const [state, setState] = useState<ProjectComponentContextState>({
    status: "loading",
    component: null,
    projectId: null,
  })

  useEffect(() => {
    let cancelled = false

    async function loadComponent() {
      const projectStorage = createBrowserProjectStorage({ storage: window.localStorage })
      const projectId = preferredProjectId?.trim() || await projectStorage.getActiveProjectId()
      const componentId = preferredComponentId?.trim() || null

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
      const component = findProjectComponentById(components, componentId)

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
  }, [preferredComponentId, preferredProjectId])

  return state
}

export {
  findProjectComponentById,
  useProjectComponent,
}

export type { ProjectComponentContextState }
