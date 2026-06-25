"use client"

import { useEffect, useState } from "react"

import { createBrowserProjectStorage } from "@/lib/project/storage"
import type { CreateProjectWorkspaceInput, ProjectWorkspace } from "@/lib/project/runtime"

type ProjectRegistryState = {
  status: "loading" | "ready" | "error"
  projects: ProjectWorkspace[]
  activeProjectId: string | null
}

type ProjectRegistryController = ProjectRegistryState & {
  createProject: (input: CreateProjectWorkspaceInput) => Promise<ProjectWorkspace>
}

const initialProjectRegistryState: ProjectRegistryState = {
  status: "loading",
  projects: [],
  activeProjectId: null,
}

function useProjectRegistry() {
  const [state, setState] = useState<ProjectRegistryState>(initialProjectRegistryState)

  useEffect(() => {
    let cancelled = false

    async function loadProjects() {
      const storage = createBrowserProjectStorage({ storage: window.localStorage })
      const [projects, activeProjectId] = await Promise.all([
        storage.listProjects(),
        storage.getActiveProjectId(),
      ])

      if (!cancelled) {
        setState({ status: "ready", projects, activeProjectId })
      }
    }

    loadProjects().catch(() => {
      if (!cancelled) {
        setState({ status: "error", projects: [], activeProjectId: null })
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  async function createProject(input: CreateProjectWorkspaceInput) {
    const storage = createBrowserProjectStorage({ storage: window.localStorage })
    const project = await storage.createProject(input)

    await storage.setActiveProjectId(project.id)

    setState((currentState) => ({
      status: "ready",
      projects: [project, ...currentState.projects.filter((item) => item.id !== project.id)],
      activeProjectId: project.id,
    }))

    return project
  }

  return {
    ...state,
    createProject,
  } satisfies ProjectRegistryController
}

export { useProjectRegistry }

export type { ProjectRegistryController, ProjectRegistryState }
