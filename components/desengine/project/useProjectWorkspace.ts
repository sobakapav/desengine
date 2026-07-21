"use client"

import { useEffect, useState } from "react"

import { fetchProjectWorkspace, runProjectWorkspaceActionOnServer } from "@/lib/project/client"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import {
  buildEmptyProjectWorkspaceState,
  buildProjectWorkspaceErrorState,
  buildProjectWorkspaceReadyState,
  type ProjectWorkspaceState,
} from "./projectWorkspaceState"

type ProjectWorkspaceController = ProjectWorkspaceState & {
  createComponent: (title: string) => Promise<ProjectComponent>
  markComponentCompleted: (componentId: string) => Promise<void>
  reopenComponent: (componentId: string) => Promise<void>
  startComponentWork: (componentId: string) => Promise<void>
  startProjectWork: () => Promise<void>
}

function useProjectWorkspace(project: ProjectWorkspace | null) {
  const projectId = project?.id ?? "project-unresolved"
  const [state, setState] = useState<ProjectWorkspaceState>(() => buildEmptyProjectWorkspaceState(projectId))

  useEffect(() => {
    let cancelled = false

    async function load() {
      if (!project) {
        if (!cancelled) {
          setState(buildEmptyProjectWorkspaceState(projectId))
        }
        return
      }

      const { snapshot } = await fetchProjectWorkspace(project.id)
      if (!snapshot) {
        throw new Error("Не удалось получить workspace snapshot проекта.")
      }
      if (!cancelled) {
        setState(buildProjectWorkspaceReadyState(snapshot))
      }
    }

    setState(buildEmptyProjectWorkspaceState(projectId))
    load().catch(() => {
      if (!cancelled) {
        setState(buildProjectWorkspaceErrorState(projectId))
      }
    })

    return () => {
      cancelled = true
    }
  }, [project, projectId])

  async function runAction(
    action:
      | { type: "start-project-work" }
      | { type: "create-component"; title: string }
      | { type: "start-component-work"; componentId: string }
      | { type: "complete-component"; componentId: string }
      | { type: "reopen-component"; componentId: string },
  ) {
    const { snapshot } = await runProjectWorkspaceActionOnServer(projectId, action)
    if (!snapshot) {
      throw new Error("Не удалось обновить рабочее состояние проекта.")
    }

    setState(buildProjectWorkspaceReadyState(snapshot))
    return snapshot
  }

  return {
    ...state,
    createComponent: async (title: string) => {
      const snapshot = await runAction({ type: "create-component", title })
      const latestComponent = snapshot.components[0] ?? null
      if (!latestComponent) {
        throw new Error("Не удалось прочитать только что созданный компонент.")
      }
      return latestComponent
    },
    markComponentCompleted: async (componentId: string) => {
      await runAction({ type: "complete-component", componentId })
    },
    reopenComponent: async (componentId: string) => {
      await runAction({ type: "reopen-component", componentId })
    },
    startComponentWork: async (componentId: string) => {
      await runAction({ type: "start-component-work", componentId })
    },
    startProjectWork: async () => {
      await runAction({ type: "start-project-work" })
    },
  } satisfies ProjectWorkspaceController
}

export { useProjectWorkspace }

export type {
  ProjectWorkspaceController,
  ProjectWorkspaceState,
}
