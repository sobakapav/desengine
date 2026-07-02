import {
  createProjectWorkspace,
  normalizeProject,
  serializeProjectWorkspace,
  type CreateProjectWorkspaceInput,
  type ProjectWorkspace,
  type RawProject,
} from "@/lib/project/runtime"
import {
  exportProjectManifest,
  importProjectManifest,
  type ProjectManifest,
  type RawProjectManifest,
} from "@/lib/project/manifest"
import {
  createBrowserProjectComponentStorage,
  getProjectComponentsStorageKey,
} from "@/lib/project/component-storage"
import {
  createBrowserProjectWorkspaceStorage,
  getProjectActivityStorageKey,
  getProjectSessionStorageKey,
} from "@/lib/project/workspace-storage"
import { normalizeProjectSession } from "@/lib/project/workspace-session"

type ProjectStorage = {
  listProjects(): Promise<ProjectWorkspace[]>
  getProject(projectId: string): Promise<ProjectWorkspace | null>
  getActiveProject(): Promise<ProjectWorkspace | null>
  createProject(input: CreateProjectWorkspaceInput): Promise<ProjectWorkspace>
  saveProject(project: ProjectWorkspace, previousProjectId?: string | null): Promise<void>
  getActiveProjectId(): Promise<string | null>
  setActiveProjectId(projectId: string): Promise<void>
  exportProjectManifest(projectId: string): Promise<ProjectManifest | null>
  importProjectManifest(manifest: RawProjectManifest): Promise<ProjectManifest>
}

type BrowserProjectStorageOptions = {
  storage: Storage
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

function createBrowserProjectBindings(storage: Storage) {
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

  function readActiveProjectId() {
    return storage.getItem(ACTIVE_PROJECT_ID_STORAGE_KEY)
  }

  async function listProjects() {
    const nextProjects = readBrowserStoredProjects(storage)
    const nextActiveProjectId = readBrowserStoredActiveProjectId(storage, nextProjects)

    if (readActiveProjectId() !== nextActiveProjectId) {
      writeActiveProjectId(nextActiveProjectId)
    }

    return nextProjects
  }

  async function getProjectsWithActiveProjectId() {
    const projects = await listProjects()
    return {
      projects,
      activeProjectId: readBrowserStoredActiveProjectId(storage, projects),
    }
  }

  async function saveBrowserProject(project: ProjectWorkspace, previousProjectId?: string | null) {
    const normalized = normalizeSavedProject(project)
    const projects = await listProjects()
    const nextProjects = mergeProject(
      removeProject(projects, resolvePreviousProjectId(previousProjectId, normalized.id)),
      normalized,
    )
    writeProjects(nextProjects)
    updateRenamedActiveProjectId({
      nextProjectId: normalized.id,
      previousProjectId,
      readActiveProjectId,
      writeActiveProjectId,
    })
  }

  return {
    getProjectsWithActiveProjectId,
    listProjects,
    saveBrowserProject,
    writeActiveProjectId,
    writeProjects,
  }
}

function createBrowserProjectStorage({ storage }: BrowserProjectStorageOptions): ProjectStorage {
  const {
    getProjectsWithActiveProjectId,
    listProjects,
    saveBrowserProject,
    writeActiveProjectId,
    writeProjects,
  } = createBrowserProjectBindings(storage)

  return {
    async listProjects() {
      return listProjects()
    },
    async getProject(projectId: string) {
      const projects = await listProjects()
      return projects.find((project) => project.id === projectId) ?? null
    },
    async getActiveProject() {
      const { projects, activeProjectId } = await getProjectsWithActiveProjectId()

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
    async saveProject(project: ProjectWorkspace, previousProjectId?: string | null) {
      await saveBrowserProject(project, previousProjectId)
    },
    async getActiveProjectId() {
      const { activeProjectId } = await getProjectsWithActiveProjectId()
      return activeProjectId
    },
    async setActiveProjectId(projectId: string) {
      const projects = await listProjects()

      if (!hasProject(projects, projectId)) {
        return
      }

      writeActiveProjectId(projectId)
    },
    async exportProjectManifest(projectId: string) {
      const project = await this.getProject(projectId)
      if (!project) {
        return null
      }

      const componentStorage = createBrowserProjectComponentStorage(storage)
      const workspaceStorage = createBrowserProjectWorkspaceStorage(storage)
      const [components, session, activities] = await Promise.all([
        componentStorage.listComponents(projectId),
        workspaceStorage.getSession(projectId),
        workspaceStorage.listActivities(projectId),
      ])

      return exportProjectManifest({
        activities,
        components,
        project,
        session,
      })
    },
    async importProjectManifest(manifest: RawProjectManifest) {
      const imported = importProjectManifest(manifest)
      await this.saveProject(imported.project)
      writeActiveProjectId(imported.project.id)

      storage.setItem(
        getProjectComponentsStorageKey(imported.project.id),
        JSON.stringify(imported.components),
      )
      storage.setItem(
        getProjectActivityStorageKey(imported.project.id),
        JSON.stringify([]),
      )
      storage.setItem(
        getProjectSessionStorageKey(imported.project.id),
        JSON.stringify(normalizeProjectSession({
          projectId: imported.project.id,
          workflowKind: "project-design-workflow",
          status: imported.components.length > 0 ? "in_progress" : "idle",
          activeComponentId: imported.components.find((component) => component.status === "in_progress")?.id ?? null,
          createdAt: imported.project.createdAt,
          updatedAt: imported.project.updatedAt,
          lastActivityAt: imported.artifactsSummary.lastActivityAt,
        }, imported.project.id)),
      )

      return imported
    },
  }
}

function createMemoryProjectStorage(initialProjects: ProjectWorkspace[] = []): ProjectStorage {
  let projects = initialProjects.map(serializeProjectWorkspace)
  let activeProjectId: string | null = projects[0]?.id ?? null
  const manifests = new Map<string, ProjectManifest>()

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
    async saveProject(project: ProjectWorkspace, previousProjectId?: string | null) {
      const normalized = serializeProjectWorkspace(project)
      projects = mergeProject(
        removeProject(projects, previousProjectId && previousProjectId !== normalized.id ? previousProjectId : null),
        normalized,
      )

      if (previousProjectId && activeProjectId === previousProjectId) {
        activeProjectId = normalized.id
      }

      if (!activeProjectId) {
        activeProjectId = normalized.id
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
    async exportProjectManifest(projectId: string) {
      if (manifests.has(projectId)) {
        return manifests.get(projectId) ?? null
      }

      const project = projects.find((item) => item.id === projectId) ?? null
      if (!project) {
        return null
      }

      const manifest = exportProjectManifest({
        activities: [],
        components: [],
        project,
        session: null,
      })
      manifests.set(projectId, manifest)
      return manifest
    },
    async importProjectManifest(manifest: RawProjectManifest) {
      const imported = importProjectManifest(manifest)
      projects = mergeProject(projects, imported.project)
      activeProjectId = imported.project.id
      manifests.set(imported.project.id, imported)
      return imported
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
