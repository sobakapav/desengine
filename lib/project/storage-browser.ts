import { createProjectWorkspace, type CreateProjectWorkspaceInput, type ProjectWorkspace } from "@/lib/project/runtime"
import { exportProjectManifest, importProjectManifest, type RawProjectManifest } from "@/lib/project/manifest"
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

import {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
  type BrowserProjectStorageOptions,
  type ProjectStorage,
} from "./storage-types"
import {
  hasProject,
  mergeProject,
  normalizeSavedProject,
  readBrowserStoredActiveProjectId,
  readBrowserStoredProjects,
  removeProject,
  resolvePreviousProjectId,
  updateRenamedActiveProjectId,
} from "./storage-shared"

function createProjectRegistryBindings(storage: Storage) {
  function writeProjects(projects: ProjectWorkspace[]) {
    storage.setItem(PROJECT_REGISTRY_STORAGE_KEY, JSON.stringify(projects))
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

async function getProjectById(listProjects: () => Promise<ProjectWorkspace[]>, projectId: string) {
  const projects = await listProjects()
  return projects.find((project) => project.id === projectId) ?? null
}

async function getActiveProjectById(args: {
  getProjectsWithActiveProjectId: () => Promise<{
    activeProjectId: string | null
    projects: ProjectWorkspace[]
  }>
}) {
  const { projects, activeProjectId } = await args.getProjectsWithActiveProjectId()
  if (!activeProjectId) {
    return null
  }

  return projects.find((project) => project.id === activeProjectId) ?? null
}

async function createBrowserProject(args: {
  input: CreateProjectWorkspaceInput
  listProjects: () => Promise<ProjectWorkspace[]>
  writeActiveProjectId: (projectId: string | null) => void
  writeProjects: (projects: ProjectWorkspace[]) => void
}) {
  const project = createProjectWorkspace(args.input)
  const projects = await args.listProjects()
  const hadProjects = projects.length > 0

  args.writeProjects(mergeProject(projects, project))
  if (!hadProjects) {
    args.writeActiveProjectId(project.id)
  }

  return project
}

async function setBrowserActiveProjectId(args: {
  listProjects: () => Promise<ProjectWorkspace[]>
  projectId: string
  writeActiveProjectId: (projectId: string | null) => void
}) {
  const projects = await args.listProjects()
  if (!hasProject(projects, args.projectId)) {
    return
  }

  args.writeActiveProjectId(args.projectId)
}

async function exportBrowserProjectManifest(storage: Storage, project: ProjectWorkspace) {
  const componentStorage = createBrowserProjectComponentStorage(storage)
  const workspaceStorage = createBrowserProjectWorkspaceStorage(storage)
  const [components, session, activities] = await Promise.all([
    componentStorage.listComponents(project.id),
    workspaceStorage.getSession(project.id),
    workspaceStorage.listActivities(project.id),
  ])

  return exportProjectManifest({
    activities,
    components,
    project,
    session,
  })
}

function writeImportedProjectArtifacts(storage: Storage, imported: Awaited<ReturnType<typeof importProjectManifest>>) {
  storage.setItem(
    getProjectComponentsStorageKey(imported.project.id),
    JSON.stringify(imported.components),
  )
  storage.setItem(getProjectActivityStorageKey(imported.project.id), JSON.stringify([]))
  storage.setItem(
    getProjectSessionStorageKey(imported.project.id),
    JSON.stringify(normalizeProjectSession({
      projectId: imported.project.id,
      workflowKind: "project-design-workflow",
      status: imported.components.length > 0 ? "in_progress" : "idle",
      createdAt: imported.project.createdAt,
      updatedAt: imported.project.updatedAt,
      lastActivityAt: imported.artifactsSummary.lastActivityAt,
    }, imported.project.id)),
  )
}

async function importBrowserProjectManifest(args: {
  manifest: RawProjectManifest
  saveBrowserProject: (project: ProjectWorkspace, previousProjectId?: string | null) => Promise<void>
  storage: Storage
  writeActiveProjectId: (projectId: string | null) => void
}) {
  const imported = importProjectManifest(args.manifest)
  await args.saveBrowserProject(imported.project)
  args.writeActiveProjectId(imported.project.id)
  writeImportedProjectArtifacts(args.storage, imported)
  return imported
}

function createBrowserProjectStorage({ storage }: BrowserProjectStorageOptions): ProjectStorage {
  const bindings = createProjectRegistryBindings(storage)

  return {
    listProjects() {
      return bindings.listProjects()
    },
    getProject(projectId: string) {
      return getProjectById(bindings.listProjects, projectId)
    },
    getActiveProject() {
      return getActiveProjectById(bindings)
    },
    createProject(input: CreateProjectWorkspaceInput) {
      return createBrowserProject({
        input,
        listProjects: bindings.listProjects,
        writeActiveProjectId: bindings.writeActiveProjectId,
        writeProjects: bindings.writeProjects,
      })
    },
    saveProject(project: ProjectWorkspace, previousProjectId?: string | null) {
      return bindings.saveBrowserProject(project, previousProjectId)
    },
    async getActiveProjectId() {
      const { activeProjectId } = await bindings.getProjectsWithActiveProjectId()
      return activeProjectId
    },
    setActiveProjectId(projectId: string) {
      return setBrowserActiveProjectId({
        listProjects: bindings.listProjects,
        projectId,
        writeActiveProjectId: bindings.writeActiveProjectId,
      })
    },
    async exportProjectManifest(projectId: string) {
      const project = await getProjectById(bindings.listProjects, projectId)
      if (!project) {
        return null
      }

      return exportBrowserProjectManifest(storage, project)
    },
    importProjectManifest(manifest: RawProjectManifest) {
      return importBrowserProjectManifest({
        manifest,
        saveBrowserProject: bindings.saveBrowserProject,
        storage,
        writeActiveProjectId: bindings.writeActiveProjectId,
      })
    },
  }
}

export { createBrowserProjectStorage }
