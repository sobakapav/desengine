"use client"

import { useEffect, useState } from "react"

import { fetchProjectOverview, type ProjectSurfaceSummary } from "@/lib/project/client"
import type { ProjectWorkspace } from "@/lib/project/runtime"

type ProjectOverviewState = {
  status: "loading" | "ready" | "missing" | "error"
  project: ProjectWorkspace | null
  rootPath: string | null
  activeProjectId: string | null
  surface: ProjectSurfaceSummary | null
}

type ProjectOverviewController = ProjectOverviewState & {
  replaceProject: (
    project: ProjectWorkspace,
    options?: {
      rootPath?: string | null
      surface?: ProjectSurfaceSummary | null
    },
  ) => void
}

const initialProjectOverviewState: ProjectOverviewState = {
  status: "loading",
  project: null,
  rootPath: null,
  activeProjectId: null,
  surface: null,
}

function useProjectOverview(projectId: string) {
  const [state, setState] = useState<ProjectOverviewState>(initialProjectOverviewState)

  useEffect(() => {
    let cancelled = false

    async function loadProject() {
      const { project, rootPath, activeProjectId, surface } = await fetchProjectOverview(projectId)

      if (cancelled) {
        return
      }

      setState(project
        ? { status: "ready", project, rootPath, activeProjectId, surface }
        : { status: "missing", project: null, rootPath: null, activeProjectId, surface: null })
    }

    loadProject().catch(() => {
      if (!cancelled) {
        setState({ status: "error", project: null, rootPath: null, activeProjectId: null, surface: null })
      }
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  function replaceProject(
    project: ProjectWorkspace,
    options?: {
      rootPath?: string | null
      surface?: ProjectSurfaceSummary | null
    },
  ) {
    setState((currentState) => ({
      status: "ready",
      project,
      rootPath: options?.rootPath ?? currentState.rootPath,
      activeProjectId: currentState.activeProjectId,
      surface: options?.surface ?? currentState.surface,
    }))
  }

  return {
    ...state,
    replaceProject,
  } satisfies ProjectOverviewController
}

export { useProjectOverview }

export type { ProjectOverviewController, ProjectOverviewState }
