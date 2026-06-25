"use client"

import { useEffect, useState } from "react"

import { createBrowserProjectStorage } from "@/lib/project/storage"
import type { ProjectWorkspace } from "@/lib/project/runtime"

type ProjectOverviewState = {
  status: "loading" | "ready" | "missing" | "error"
  project: ProjectWorkspace | null
  activeProjectId: string | null
}

type ProjectOverviewController = ProjectOverviewState & {
  replaceProject: (project: ProjectWorkspace) => void
}

const initialProjectOverviewState: ProjectOverviewState = {
  status: "loading",
  project: null,
  activeProjectId: null,
}

function useProjectOverview(projectId: string) {
  const [state, setState] = useState<ProjectOverviewState>(initialProjectOverviewState)

  useEffect(() => {
    let cancelled = false

    async function loadProject() {
      const storage = createBrowserProjectStorage({ storage: window.localStorage })
      const [project, activeProjectId] = await Promise.all([
        storage.getProject(projectId),
        storage.getActiveProjectId(),
      ])

      if (cancelled) {
        return
      }

      setState(project
        ? { status: "ready", project, activeProjectId }
        : { status: "missing", project: null, activeProjectId })
    }

    loadProject().catch(() => {
      if (!cancelled) {
        setState({ status: "error", project: null, activeProjectId: null })
      }
    })

    return () => {
      cancelled = true
    }
  }, [projectId])

  function replaceProject(project: ProjectWorkspace) {
    setState((currentState) => ({
      status: "ready",
      project,
      activeProjectId: currentState.activeProjectId,
    }))
  }

  return {
    ...state,
    replaceProject,
  } satisfies ProjectOverviewController
}

export { useProjectOverview }

export type { ProjectOverviewController, ProjectOverviewState }
