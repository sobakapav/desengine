"use client"

import { useEffect, useState } from "react"

import { fetchProjectRegistry, fetchProjectWorkspace } from "@/lib/project/client"
import type { ProjectComponent } from "@/lib/project/component-runtime"

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
      const registry = await fetchProjectRegistry()
      const projectId = preferredProjectId?.trim() || registry.activeProjectId
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

      const workspace = await fetchProjectWorkspace(projectId)
      const components = workspace.snapshot?.components ?? []
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
