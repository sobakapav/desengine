"use client"

import { useEffect, useState } from "react"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkspace } from "@/lib/project/runtime"

import { createProjectWorkspaceActions } from "./projectWorkspaceActions"
import {
  buildEmptyProjectWorkspaceState,
  buildProjectWorkspaceErrorState,
  buildProjectWorkspaceReadyState,
  readProjectWorkspaceSnapshot,
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

      const snapshot = await readProjectWorkspaceSnapshot(project)
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

  async function refresh() {
    if (!project) {
      setState(buildEmptyProjectWorkspaceState(projectId))
      return
    }

    setState(buildProjectWorkspaceReadyState(await readProjectWorkspaceSnapshot(project)))
  }

  return {
    ...state,
    ...createProjectWorkspaceActions({ projectId, refresh }),
  } satisfies ProjectWorkspaceController
}

export { useProjectWorkspace }

export type {
  ProjectWorkspaceController,
  ProjectWorkspaceState,
}
