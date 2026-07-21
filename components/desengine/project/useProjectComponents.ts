"use client"

import { useEffect, useState } from "react"

import { fetchProjectWorkspace, runProjectWorkspaceActionOnServer } from "@/lib/project/client"
import type { CreateProjectComponentInput, ProjectComponent } from "@/lib/project/component-runtime"

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
      const { snapshot } = await fetchProjectWorkspace(projectId)
      const components = snapshot?.components ?? []

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
    const { snapshot } = await runProjectWorkspaceActionOnServer(projectId, {
      type: "create-component",
      title: input.title,
    })
    const component = snapshot?.components[0] ?? null
    if (!component) {
      throw new Error("Не удалось создать компонент проекта.")
    }

    setState((currentState) => ({
      status: "ready",
      components: snapshot?.components ?? currentState.components,
    }))

    return component
  }

  async function saveComponent(component: ProjectComponent) {
    const action = component.status === "completed"
      ? { type: "complete-component", componentId: component.id } as const
      : { type: "reopen-component", componentId: component.id } as const
    const { snapshot } = await runProjectWorkspaceActionOnServer(projectId, action)
    const savedComponent = snapshot?.components.find((item) => item.id === component.id) ?? component

    setState((currentState) => ({
      status: "ready",
      components: snapshot?.components ?? currentState.components,
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
