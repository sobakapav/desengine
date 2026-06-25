"use client"

import type { Dispatch, SetStateAction } from "react"

import { sandpackUiKitsConfig } from "@/lib/lab/sandpack-ui-kits.config"
import {
  createProjectWorkspace,
  normalizeProject,
  type Project,
} from "@/lib/project/runtime"
import { createBrowserProjectStorage, type ProjectStorage } from "@/lib/project/storage"

import type { WorkbenchProps } from "./props"

type TaskScopeSnapshot = {
  ok: true
  taskItem: WorkbenchProps["taskItem"]
  taskData: WorkbenchProps["taskData"]
}

type ProjectControllerMutableState = {
  setPreviewVersion: Dispatch<SetStateAction<number>>
  setProject: Dispatch<SetStateAction<Project>>
  setProjects: Dispatch<SetStateAction<Project[]>>
  setProjectActionError: Dispatch<SetStateAction<string>>
  setProjectActionPending: Dispatch<SetStateAction<boolean>>
}

type RefreshProjectStateArgs = ProjectControllerMutableState & {
  projectStorage: ProjectStorage | null
  taskId: string
  preferredProjectId?: string
  commit?: boolean
}

type PersistProjectArgs = ProjectControllerMutableState & {
  nextProject: Project
  projectStorage: ProjectStorage | null
  bumpPreview?: boolean
}

type CreateProjectArgs = ProjectControllerMutableState & {
  projectStorage: ProjectStorage | null
  taskId: string
  title: string
  refreshProjectState: (preferredProjectId?: string, options?: { commit?: boolean }) => Promise<Project>
}

type SelectProjectArgs = ProjectControllerMutableState & {
  currentProject: Project
  projectStorage: ProjectStorage | null
  projectId: string
  refreshProjectState: (preferredProjectId?: string, options?: { commit?: boolean }) => Promise<Project>
}

export function createProjectPlaceholder(taskId: string) {
  return normalizeProject({
    id: `task-${taskId}`,
    title: `Проект ${taskId}`,
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
    settings: {
      uiKitId: "none",
    },
  })
}

/**
 * @example
 * ```ts
 * const draft = createLabProjectDraft("task-1", "Alpha")
 * ```
 */
export function createLabProjectDraft(taskId: string, title = `Проект ${taskId}`) {
  return {
    id: `task-${taskId}`,
    title,
  }
}

/**
 * @example
 * ```ts
 * const fallback = createFallbackProject("task-1", "Alpha")
 * ```
 */
export function createFallbackProject(taskId: string, title?: string) {
  if (!title) {
    return createProjectPlaceholder(taskId)
  }

  return normalizeProject({
    ...createProjectWorkspace(createLabProjectDraft(taskId, title)),
    createdAt: "1970-01-01T00:00:00.000Z",
    updatedAt: "1970-01-01T00:00:00.000Z",
    settings: {
      uiKitId: "none",
    },
  })
}

export function createProjectStorage(taskId: string) {
  if (typeof window === "undefined") return null
  return createBrowserProjectStorage({ storage: window.localStorage, taskId })
}

export function listProjectUiKitOptions() {
  return Object.values(sandpackUiKitsConfig)
}

function mergeProjects(currentProjects: Project[], nextProject: Project) {
  const existingIndex = currentProjects.findIndex((project) => project.id === nextProject.id)

  if (existingIndex < 0) {
    return [...currentProjects, nextProject]
  }

  return currentProjects.map((project, index) => index === existingIndex ? nextProject : project)
}

function buildTaskScopeUrl(taskId: string, project: Project) {
  const params = new URLSearchParams({
    projectId: project.id,
    projectTitle: project.title,
    uiKitId: project.settings.uiKitId,
  })

  return `/api/tasks/${encodeURIComponent(taskId)}?${params.toString()}`
}

/**
 * @example
 * ```ts
 * const snapshot = await fetchTaskScopeSnapshot(taskId, project)
 * replaceTaskData(snapshot.taskData)
 * ```
 */
export async function fetchTaskScopeSnapshot(taskId: string, project: Project) {
  const res = await fetch(buildTaskScopeUrl(taskId, project), { method: "GET" })
  const data = await res.json().catch(() => null)

  if (!res.ok || !data?.ok || !data.taskItem || !data.taskData) {
    throw new Error(data?.error || "Не удалось перезагрузить данные задачи для выбранного проекта.")
  }

  return data as TaskScopeSnapshot
}

/**
 * @example
 * ```ts
 * const project = await refreshProjectControllerState({
 *   projectStorage,
 *   setProject,
 *   setProjects,
 *   setProjectActionError,
 *   setProjectActionPending,
 *   setPreviewVersion,
 *   taskId,
 * })
 * ```
 */
export async function refreshProjectControllerState(args: RefreshProjectStateArgs) {
  const shouldCommit = args.commit ?? true

  if (!args.projectStorage) {
    const nextFallbackProject = createFallbackProject(args.taskId)
    if (shouldCommit) {
      args.setProject(nextFallbackProject)
      args.setProjects([nextFallbackProject])
    }
    return nextFallbackProject
  }

  const nextProjects = await args.projectStorage.listProjects()
  const candidateProject = args.preferredProjectId
    ? await args.projectStorage.getProject(args.preferredProjectId)
    : await args.projectStorage.getActiveProject()

  const nextProject = candidateProject
    ?? nextProjects[0]
    ?? await args.projectStorage.createProject(createLabProjectDraft(args.taskId))

  await args.projectStorage.setActiveProjectId(nextProject.id)
  const resolvedProjects = await args.projectStorage.listProjects()

  if (shouldCommit) {
    args.setProject(nextProject)
    args.setProjects(resolvedProjects)
  }
  return nextProject
}

/**
 * @example
 * ```ts
 * const persisted = persistProjectState({ nextProject, projectStorage, ...controllerState })
 * ```
 */
export function persistProjectState(args: PersistProjectArgs) {
  const normalized = normalizeProject(args.nextProject)

  args.setProject(normalized)
  args.setProjects((currentProjects) => mergeProjects(currentProjects, normalized))
  args.setProjectActionError("")

  if (args.bumpPreview !== false) {
    args.setPreviewVersion((value) => value + 1)
  }

  void args.projectStorage?.saveProject(normalized)
    .then(() => args.projectStorage?.setActiveProjectId(normalized.id))
    .catch(() => {
      // localStorage может быть недоступен в приватном режиме; runtime продолжит работать в памяти страницы.
    })

  return normalized
}

/**
 * @example
 * ```ts
 * const created = await createProjectInScope({
 *   title: "Alpha",
 *   taskId,
 *   projectStorage,
 *   refreshProjectState,
 *   ...controllerState,
 * })
 * ```
 */
export async function createProjectInScope(args: CreateProjectArgs) {
  const normalizedTitle = args.title.trim()

  if (!normalizedTitle) {
    args.setProjectActionError("Укажите название проекта, чтобы создать новый workspace.")
    return null
  }

  args.setProjectActionPending(true)
  args.setProjectActionError("")

  try {
    if (!args.projectStorage) {
      const nextFallbackProject = createFallbackProject(args.taskId, normalizedTitle)
      args.setProject(nextFallbackProject)
      args.setProjects([nextFallbackProject])
      args.setPreviewVersion((value) => value + 1)
      return nextFallbackProject
    }

    const createdProject = await args.projectStorage.createProject({ title: normalizedTitle })
    await args.projectStorage.setActiveProjectId(createdProject.id)
    await args.refreshProjectState(createdProject.id)
    args.setPreviewVersion((value) => value + 1)
    return createdProject
  } catch {
    args.setProjectActionError("Не удалось создать проект. Проверьте localStorage и попробуйте снова.")
    return null
  } finally {
    args.setProjectActionPending(false)
  }
}

/**
 * @example
 * ```ts
 * const activeProject = await selectProjectInScope({
 *   currentProject: project,
 *   projectId: "project-2",
 *   projectStorage,
 *   refreshProjectState,
 *   ...controllerState,
 * })
 * ```
 */
export async function selectProjectInScope(args: SelectProjectArgs) {
  if (args.currentProject.id === args.projectId) {
    return args.currentProject
  }

  args.setProjectActionPending(true)
  args.setProjectActionError("")

  try {
    if (!args.projectStorage) {
      return null
    }

    await args.projectStorage.setActiveProjectId(args.projectId)
    const nextProject = await args.refreshProjectState(args.projectId)
    if (nextProject.id !== args.currentProject.id) {
      args.setPreviewVersion((value) => value + 1)
    }
    return nextProject
  } catch {
    args.setProjectActionError("Не удалось переключить active project.")
    return null
  } finally {
    args.setProjectActionPending(false)
  }
}

export function createRuntimeProject(taskId: string) {
  return createProjectWorkspace(createLabProjectDraft(taskId))
}
