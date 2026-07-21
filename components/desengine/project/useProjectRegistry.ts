"use client"

import { useEffect, useState } from "react"

import type { CreateProjectWorkspaceInput, ProjectWorkspace } from "@/lib/project/runtime"
import {
  connectProjectOnServer,
  createProjectOnServer,
  fetchProjectRegistry,
  type StoredProject,
} from "@/lib/project/client"

type ProjectRegistryState = {
  status: "loading" | "ready" | "error"
  projects: StoredProject[]
  activeProjectId: string | null
}

type ProjectRegistryController = ProjectRegistryState & {
  connectProject: (rootPath: string) => Promise<ProjectWorkspace>
  createProject: (input: CreateProjectWorkspaceInput & { code?: string; rootPath: string }) => Promise<ProjectWorkspace>
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
      const { projects, activeProjectId } = await fetchProjectRegistry()

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

  async function createProject(input: CreateProjectWorkspaceInput & { code?: string; rootPath: string }) {
    const { project, rootPath, surface } = await createProjectOnServer({
      code: input.code,
      id: input.id,
      rootPath: input.rootPath,
      title: input.title?.trim() || "Новый проект",
      uiKitId: input.uiKitId ?? "ant",
      mode: "create",
    })

    setState((currentState) => ({
      status: "ready",
      projects: [
        { project, rootPath, surface },
        ...currentState.projects.filter((item) => item.project.id !== project.id),
      ],
      activeProjectId: project.id,
    }))

    return project
  }

  async function connectProject(rootPath: string) {
    const { project } = await connectProjectOnServer({
      mode: "connect",
      rootPath,
    })

    const nextState = await fetchProjectRegistry()
    setState({
      status: "ready",
      projects: nextState.projects,
      activeProjectId: nextState.activeProjectId,
    })

    return project
  }

  return {
    ...state,
    connectProject,
    createProject,
  } satisfies ProjectRegistryController
}

export { useProjectRegistry }

export type { ProjectRegistryController, ProjectRegistryState }
