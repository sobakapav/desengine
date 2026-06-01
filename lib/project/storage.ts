import {
  createDefaultProject,
  getProjectStorageKey,
  normalizeProject,
  serializeProjectWorkspace,
  type ProjectWorkspace,
  type RawProject,
} from "@/lib/project/runtime"

type ProjectStorage = {
  listProjects(): Promise<ProjectWorkspace[]>
  getProject(projectId: string): Promise<ProjectWorkspace | null>
  saveProject(project: ProjectWorkspace): Promise<void>
  getActiveProjectId(): Promise<string | null>
  setActiveProjectId(projectId: string): Promise<void>
}

type BrowserProjectStorageOptions = {
  storage: Storage
  taskId?: string
}

const PROJECT_REGISTRY_STORAGE_KEY = "desengine:project-workspaces"
const ACTIVE_PROJECT_ID_STORAGE_KEY = "desengine:active-project-id"

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

  return rawList.map((item) => normalizeProject(item as RawProject))
}

function mergeProject(projects: ProjectWorkspace[], project: ProjectWorkspace) {
  const normalized = serializeProjectWorkspace(project)
  const existingIndex = projects.findIndex((item) => item.id === normalized.id)

  if (existingIndex >= 0) {
    return projects.map((item, index) => (index === existingIndex ? normalized : item))
  }

  return [...projects, normalized]
}

function readLegacyTaskProject(storage: Storage, taskId: string) {
  const legacyProject = readStorageJson(storage, getProjectStorageKey(taskId))
  if (!legacyProject || typeof legacyProject !== "object") return null

  return normalizeProject({
    ...(legacyProject as RawProject),
    id: `task-${taskId}`,
    title: `Проект ${taskId}`,
  })
}

function readBrowserStoredProjects(storage: Storage, taskId?: string) {
  const projects = normalizeProjectList(readStorageJson(storage, PROJECT_REGISTRY_STORAGE_KEY))
  const legacyProject = taskId ? readLegacyTaskProject(storage, taskId) : null

  if (!legacyProject || projects.some((project) => project.id === legacyProject.id)) {
    return projects
  }

  return mergeProject(projects, legacyProject)
}

function readBrowserStoredProject(storage: Storage, projectId: string, taskId?: string) {
  return readBrowserStoredProjects(storage, taskId)
    .find((project) => project.id === projectId) ?? null
}

function readBrowserStoredActiveProjectId(storage: Storage, taskId?: string) {
  const activeProjectId = storage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY)
  if (activeProjectId?.trim()) return activeProjectId
  return taskId ? `task-${taskId}` : null
}

function createBrowserProjectStorage({ storage, taskId }: BrowserProjectStorageOptions): ProjectStorage {
  function writeProjects(projects: ProjectWorkspace[]) {
    storage.setItem(PROJECT_REGISTRY_STORAGE_KEY, JSON.stringify(projects.map(serializeProjectWorkspace)))
  }

  function shouldPersistLegacyMigration() {
    const legacyProject = taskId ? readLegacyTaskProject(storage, taskId) : null

    if (!legacyProject) {
      return false
    }

    const persistedProjects = normalizeProjectList(readStorageJson(storage, PROJECT_REGISTRY_STORAGE_KEY))

    return !persistedProjects.some((project) => project.id === legacyProject.id && project.title === legacyProject.title)
  }

  async function listProjects() {
    const nextProjects = readBrowserStoredProjects(storage, taskId)

    if (!shouldPersistLegacyMigration()) {
      return nextProjects
    }

    writeProjects(nextProjects)
    return nextProjects
  }

  return {
    async listProjects() {
      return listProjects()
    },
    async getProject(projectId: string) {
      const projects = await listProjects()
      return projects.find((project) => project.id === projectId) ?? null
    },
    async saveProject(project: ProjectWorkspace) {
      const normalized = serializeProjectWorkspace({
        ...project,
        updatedAt: new Date().toISOString(),
      })
      const projects = await listProjects()
      writeProjects(mergeProject(projects, normalized))
    },
    async getActiveProjectId() {
      return readBrowserStoredActiveProjectId(storage, taskId)
    },
    async setActiveProjectId(projectId: string) {
      storage.setItem(ACTIVE_PROJECT_ID_STORAGE_KEY, projectId)
    },
  }
}

function createMemoryProjectStorage(initialProjects: ProjectWorkspace[] = []): ProjectStorage {
  let projects = initialProjects.map(serializeProjectWorkspace)
  let activeProjectId: string | null = projects[0]?.id ?? null

  return {
    async listProjects() {
      return projects
    },
    async getProject(projectId: string) {
      return projects.find((project) => project.id === projectId) ?? null
    },
    async saveProject(project: ProjectWorkspace) {
      projects = mergeProject(projects, serializeProjectWorkspace(project))
    },
    async getActiveProjectId() {
      return activeProjectId
    },
    async setActiveProjectId(projectId: string) {
      activeProjectId = projectId
      if (!projects.some((project) => project.id === projectId)) {
        projects = mergeProject(projects, createDefaultProject(projectId))
      }
    },
  }
}

export {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
  createBrowserProjectStorage,
  createMemoryProjectStorage,
  readBrowserStoredActiveProjectId,
  readBrowserStoredProject,
  readBrowserStoredProjects,
  type BrowserProjectStorageOptions,
  type ProjectStorage,
}
