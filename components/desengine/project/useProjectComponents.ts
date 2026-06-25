"use client"

import { useEffect, useState } from "react"

import type { CreateProjectComponentInput, ProjectComponent } from "@/lib/project/component-runtime"
import { createBrowserProjectComponentStorage } from "@/lib/project/component-storage"

type ProjectComponentsState = {
  status: "loading" | "ready" | "error"
  components: ProjectComponent[]
}

type ProjectComponentsController = ProjectComponentsState & {
  createComponent: (input: Omit<CreateProjectComponentInput, "projectId">) => Promise<ProjectComponent>
  saveComponent: (component: ProjectComponent) => Promise<ProjectComponent>
}

const initialProjectComponentsState: ProjectComponentsState = {
  status: "loading",
  components: [],
}

/**
 * @example
 * ```tsx
 * const state = useProjectComponents("project-1")
 * ```
 */
function useProjectComponents(projectId: string) {
  const [state, setState] = useState<ProjectComponentsState>(initialProjectComponentsState)

  useEffect(() => {
    let cancelled = false

    async function loadComponents() {
      const storage = createBrowserProjectComponentStorage(window.localStorage)
      const components = await storage.listComponents(projectId)

      if (!cancelled) {
        setState({
          status: "ready",
          components,
        })
      }
    }

    loadComponents().catch(() => {
      if (!cancelled) {
        setState({
          status: "error",
          components: [],
        })
      }
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  async function createComponent(input: Omit<CreateProjectComponentInput, "projectId">) {
    const storage = createBrowserProjectComponentStorage(window.localStorage)
    const component = await storage.createComponent({
      ...input,
      projectId,
    })

    setState((currentState) => ({
      status: "ready",
      components: [component, ...currentState.components.filter((item) => item.id !== component.id)],
    }))

    return component
  }

  async function saveComponent(component: ProjectComponent) {
    const storage = createBrowserProjectComponentStorage(window.localStorage)
    await storage.saveComponent(component)

    const savedComponent = {
      ...component,
      updatedAt: new Date().toISOString(),
    }

    setState((currentState) => ({
      status: "ready",
      components: [savedComponent, ...currentState.components.filter((item) => item.id !== savedComponent.id)],
    }))

    return savedComponent
  }

  return {
    ...state,
    createComponent,
    saveComponent,
  } satisfies ProjectComponentsController
}

export { useProjectComponents }

export type { ProjectComponentsController, ProjectComponentsState }
