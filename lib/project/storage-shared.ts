import {
  normalizeProject,
  serializeProjectWorkspace,
  type ProjectWorkspace,
  type RawProject,
} from "@/lib/project/runtime"

import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
} from "./storage-types"

function readStorageJson(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function normalizeProjectList(rawList: unknown): ProjectWorkspace[] {
  if (!Array.isArray(rawList)) return []
  return rawList.map((item) => serializeProjectWorkspace(normalizeProject(item as RawProject)))
}

function mergeProject(projects: ProjectWorkspace[], project: ProjectWorkspace) {
  const normalized = serializeProjectWorkspace(project)
  const existingIndex = projects.findIndex((item) => item.id === normalized.id)
  if (existingIndex >= 0) {
    return projects.map((item, index) => (index === existingIndex ? normalized : item))
  }

  return [...projects, normalized]
}

function removeProject(projects: ProjectWorkspace[], projectId: string | null | undefined) {
  if (!projectId?.trim()) {
    return projects
  }

  return projects.filter((project) => project.id !== projectId)
}

function hasProject(projects: ProjectWorkspace[], projectId: string | null | undefined) {
  if (!projectId?.trim()) return false
  return projects.some((project) => project.id === projectId)
}

function readBrowserStoredProjects(storage: Storage) {
  return normalizeProjectList(readStorageJson(storage, PROJECT_REGISTRY_STORAGE_KEY))
}

function readBrowserStoredProject(storage: Storage, projectId: string) {
  return readBrowserStoredProjects(storage)
    .find((project) => project.id === projectId) ?? null
}

function readBrowserStoredActiveProjectId(
  storage: Storage,
  projectsOrLegacyValue?: string | ProjectWorkspace[],
  maybeProjects?: ProjectWorkspace[],
) {
  const projects = Array.isArray(projectsOrLegacyValue)
    ? projectsOrLegacyValue
    : Array.isArray(maybeProjects)
      ? maybeProjects
      : readBrowserStoredProjects(storage)
  const activeProjectId = storage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY)
  if (hasProject(projects, activeProjectId)) return activeProjectId ?? null
  return projects[0]?.id ?? null
}

function normalizeSavedProject(project: ProjectWorkspace) {
  return serializeProjectWorkspace({
    ...project,
    updatedAt: new Date().toISOString(),
  })
}

function resolvePreviousProjectId(previousProjectId: string | null | undefined, nextProjectId: string) {
  if (!previousProjectId || previousProjectId === nextProjectId) {
    return null
  }

  return previousProjectId
}

function updateRenamedActiveProjectId(args: {
  nextProjectId: string
  previousProjectId: string | null | undefined
  readActiveProjectId: () => string | null
  writeActiveProjectId: (projectId: string | null) => void
}) {
  if (!args.previousProjectId || args.readActiveProjectId() !== args.previousProjectId) {
    return
  }

  args.writeActiveProjectId(args.nextProjectId)
}

export {
  hasProject,
  mergeProject,
  normalizeSavedProject,
  readBrowserStoredActiveProjectId,
  readBrowserStoredProject,
  readBrowserStoredProjects,
  readStorageJson,
  removeProject,
  resolvePreviousProjectId,
  updateRenamedActiveProjectId,
}
