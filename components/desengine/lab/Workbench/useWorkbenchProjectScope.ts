"use client"

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react"

import type { Project } from "@/lib/project/runtime"
import { readProjectFromTaskUrl } from "../task-client-boundary"

import type { WorkbenchProps } from "./props"
import {
  createFallbackProject,
  createProjectInScope,
  createProjectStorage,
  createRuntimeProject,
  listProjectUiKitOptions,
  persistProjectState,
  refreshProjectControllerState,
  selectProjectInScope,
} from "./projectScopeShared"
import {
  handleProjectCreation,
  handleProjectSelection,
  migrateProjectUiKitInScope,
} from "./projectScopeRuntime"

function useProjectBootstrap(args: {
  projectStorage: ReturnType<typeof createProjectStorage>
  setProject: Dispatch<SetStateAction<Project>>
  setProjectActionError: Dispatch<SetStateAction<string>>
  setProjectActionPending: Dispatch<SetStateAction<boolean>>
  setProjects: Dispatch<SetStateAction<Project[]>>
  setPreviewVersion: Dispatch<SetStateAction<number>>
  setProjectReady: Dispatch<SetStateAction<boolean>>
  taskId: string
}) {
  useEffect(() => {
    let cancelled = false

    async function loadProject() {
      const urlProject = readProjectFromTaskUrl(args.taskId)
      const nextFallbackProject = createFallbackProject(args.taskId)

      args.setProjectReady(false)
      args.setProject(nextFallbackProject)
      args.setProjects([nextFallbackProject])

      if (urlProject) {
        args.setProject(urlProject)
        args.setProjects([urlProject])
        args.setProjectReady(true)
        return
      }

      if (!args.projectStorage) {
        const runtimeProject = createRuntimeProject(args.taskId)
        args.setProject(runtimeProject)
        args.setProjects([runtimeProject])
        args.setProjectReady(true)
        return
      }

      try {
        const nextProject = await refreshProjectControllerState({
          commit: false,
          projectStorage: args.projectStorage,
          setProject: args.setProject,
          setProjectActionError: args.setProjectActionError,
          setProjectActionPending: args.setProjectActionPending,
          setProjects: args.setProjects,
          setPreviewVersion: args.setPreviewVersion,
          taskId: args.taskId,
        })
        if (cancelled) return
        args.setProject(nextProject)
        args.setProjects(await args.projectStorage.listProjects())
        args.setProjectReady(true)
      } catch {
        if (cancelled) return
        const runtimeProject = createRuntimeProject(args.taskId)
        args.setProject(runtimeProject)
        args.setProjects([runtimeProject])
        args.setProjectReady(true)
      }
    }

    void loadProject()
    return () => { cancelled = true }
  }, [
    args.projectStorage,
    args.setProject,
    args.setProjectActionError,
    args.setProjectActionPending,
    args.setProjectReady,
    args.setProjects,
    args.setPreviewVersion,
    args.taskId,
  ])
}

/**
 * @example
 * ```ts
 * const projectState = useProjectController(taskId)
 * if (projectState.projectReady) console.log(projectState.project.settings.uiKitId)
 * ```
 */
export function useProjectController(taskId: string) {
  const fallbackProject = createFallbackProject(taskId)
  const [previewVersion, setPreviewVersion] = useState(0)
  const [project, setProject] = useState<Project>(fallbackProject)
  const [projects, setProjects] = useState<Project[]>([fallbackProject])
  const [projectReady, setProjectReady] = useState(false)
  const [projectActionPending, setProjectActionPending] = useState(false)
  const [projectActionError, setProjectActionError] = useState("")
  const projectStorage = useMemo(() => createProjectStorage(taskId), [taskId])
  const uiKitOptions = useMemo(() => listProjectUiKitOptions(), [])

  const controllerState = {
    setPreviewVersion,
    setProject,
    setProjects,
    setProjectActionError,
    setProjectActionPending,
  }
  const refreshProjectState = (preferredProjectId?: string, options?: { commit?: boolean }) => (
    refreshProjectControllerState({ ...controllerState, commit: options?.commit, preferredProjectId, projectStorage, taskId })
  )
  const persistProject = (nextProject: Project, options?: { bumpPreview?: boolean }) => (
    persistProjectState({ ...controllerState, bumpPreview: options?.bumpPreview, nextProject, projectStorage })
  )
  const createProject = (title: string) => (
    createProjectInScope({ ...controllerState, projectStorage, refreshProjectState, taskId, title })
  )
  const selectProject = (projectId: string) => (
    selectProjectInScope({ ...controllerState, currentProject: project, projectId, projectStorage, refreshProjectState })
  )

  useProjectBootstrap({
    projectStorage,
    setProject,
    setProjectActionError,
    setProjectActionPending,
    setProjectReady,
    setProjects,
    setPreviewVersion,
    taskId,
  })

  return {
    createProject,
    persistProject,
    previewVersion,
    project,
    projectActionError,
    projectActionPending,
    projectReady,
    projects,
    selectProject,
    setProjectActionError,
    setProjectActionPending,
    setPreviewVersion,
    uiKitOptions,
  }
}

/**
 * @example
 * ```ts
 * const projectScope = useWorkbenchProjectScope({ projectState, props, replaceTaskData, saveBeforeAction })
 * await projectScope.handleProjectSelect("project-2")
 * ```
 */
export function useWorkbenchProjectScope(args: {
  projectState: ReturnType<typeof useProjectController>
  props: Pick<WorkbenchProps, "onScreenEventChange" | "onTaskItemChange" | "screenEvent" | "taskItem">
  replaceTaskData: (taskData: WorkbenchProps["taskData"]) => void
  saveBeforeAction: (targetFileIds?: string[]) => Promise<boolean>
}) {
  const runtimeArgs = args
  const handleProjectSelect = (projectId: string) => handleProjectSelection(runtimeArgs, projectId)
  const handleProjectCreate = (title: string) => handleProjectCreation(runtimeArgs, title)
  const migrateProjectUiKit = (nextUiKitId: Project["settings"]["uiKitId"]) => (
    migrateProjectUiKitInScope(runtimeArgs, nextUiKitId)
  )

  return {
    ...args.projectState,
    handleProjectCreate,
    handleProjectSelect,
    migrateProjectUiKit,
  }
}
