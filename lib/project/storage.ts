import {
  createProjectWorkspace,
  getProjectStorageKey,
  normalizeProject,
  serializeProjectWorkspace,
  type CreateProjectWorkspaceInput,
  type ProjectWorkspace,
  type RawProject,
} from "@/lib/project/runtime"

type ProjectStorage = {
  listProjects(): Promise<ProjectWorkspace[]>
  getProject(projectId: string): Promise<ProjectWorkspace | null>
  getActiveProject(): Promise<ProjectWorkspace | null>
  createProject(input: CreateProjectWorkspaceInput): Promise<ProjectWorkspace>
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

function hasProject(projects: ProjectWorkspace[], projectId: string | null | undefined) {
  if (!projectId?.trim()) return false
  return projects.some((project) => project.id === projectId)
}

function readLegacyTaskProject(storage: Storage, taskId: string) {
  const legacyProject = readStorageJson(storage, getProjectStorageKey(taskId))
  if (!legacyProject || typeof legacyProject !== "object") return null

  return serializeProjectWorkspace(normalizeProject({
    ...(legacyProject as RawProject),
    id: `task-${taskId}`,
    title: `Проект ${taskId}`,
  }))
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

function readBrowserStoredActiveProjectId(
  storage: Storage,
  taskId?: string,
  projects = readBrowserStoredProjects(storage, taskId),
) {
  const activeProjectId = storage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY)
  if (hasProject(projects, activeProjectId)) return activeProjectId ?? null
  return projects[0]?.id ?? null
}

function createBrowserProjectStorage({ storage, taskId }: BrowserProjectStorageOptions): ProjectStorage {
  function writeProjects(projects: ProjectWorkspace[]) {
    storage.setItem(PROJECT_REGISTRY_STORAGE_KEY, JSON.stringify(projects.map(serializeProjectWorkspace)))
  }

  function writeActiveProjectId(projectId: string | null) {
    if (!projectId) {
      storage.removeItem(ACTIVE_PROJECT_ID_STORAGE_KEY)
      return
    }

    storage.setItem(ACTIVE_PROJECT_ID_STORAGE_KEY, projectId)
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
    const nextActiveProjectId = readBrowserStoredActiveProjectId(storage, taskId, nextProjects)

    if (shouldPersistLegacyMigration()) {
      writeProjects(nextProjects)
    }

    if (storage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY) !== nextActiveProjectId) {
      writeActiveProjectId(nextActiveProjectId)
    }

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
    async getActiveProject() {
      const projects = await listProjects()
      const activeProjectId = readBrowserStoredActiveProjectId(storage, taskId, projects)

      if (!activeProjectId) {
        return null
      }

      return projects.find((project) => project.id === activeProjectId) ?? null
    },
    async createProject(input: CreateProjectWorkspaceInput) {
      const project = createProjectWorkspace(input)
      const projects = await listProjects()
      const hadProjects = projects.length > 0

      writeProjects(mergeProject(projects, project))
      if (!hadProjects) {
        writeActiveProjectId(project.id)
      }

      return project
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
      const projects = await listProjects()
      return readBrowserStoredActiveProjectId(storage, taskId, projects)
    },
    async setActiveProjectId(projectId: string) {
      const projects = await listProjects()

      if (!hasProject(projects, projectId)) {
        return
      }

      writeActiveProjectId(projectId)
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
    async getActiveProject() {
      return projects.find((project) => project.id === activeProjectId) ?? null
    },
    async createProject(input: CreateProjectWorkspaceInput) {
      const project = createProjectWorkspace(input)

      projects = mergeProject(projects, project)
      if (!activeProjectId || !hasProject(projects, activeProjectId)) {
        activeProjectId = project.id
      }

      return project
    },
    async saveProject(project: ProjectWorkspace) {
      projects = mergeProject(projects, serializeProjectWorkspace(project))
      if (!activeProjectId) {
        activeProjectId = project.id
      }
    },
    async getActiveProjectId() {
      return activeProjectId
    },
    async setActiveProjectId(projectId: string) {
      if (!hasProject(projects, projectId)) {
        return
      }

      activeProjectId = projectId
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
