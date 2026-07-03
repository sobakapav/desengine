import { createProjectWorkspace, serializeProjectWorkspace, type CreateProjectWorkspaceInput, type ProjectWorkspace } from "@/lib/project/runtime"
import { exportProjectManifest, importProjectManifest, type ProjectManifest, type RawProjectManifest } from "@/lib/project/manifest"

import { hasProject, mergeProject, removeProject } from "./storage-shared"
import { type ProjectStorage } from "./storage-types"

function updateMemoryProjectList(args: {
  previousProjectId?: string | null
  project: ProjectWorkspace
  projects: ProjectWorkspace[]
}) {
  const normalized = serializeProjectWorkspace(args.project)
  return mergeProject(
    removeProject(
      args.projects,
      args.previousProjectId && args.previousProjectId !== normalized.id ? args.previousProjectId : null,
    ),
    normalized,
  )
}

function buildMemoryProjectManifest(project: ProjectWorkspace) {
  return exportProjectManifest({
    activities: [],
    components: [],
    project,
    session: null,
  })
}

function readMemoryProjectManifest(args: {
  manifests: Map<string, ProjectManifest>
  projectId: string
  projects: ProjectWorkspace[]
}) {
  const cachedManifest = args.manifests.get(args.projectId)
  if (cachedManifest) {
    return cachedManifest
  }

  const project = args.projects.find((item) => item.id === args.projectId) ?? null
  if (!project) {
    return null
  }

  const manifest = buildMemoryProjectManifest(project)
  args.manifests.set(args.projectId, manifest)
  return manifest
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
      const nextProjectId = serializeProjectWorkspace(project).id
      projects = updateMemoryProjectList({ previousProjectId, project, projects })
      if (previousProjectId && activeProjectId === previousProjectId) {
        activeProjectId = nextProjectId
      }
      if (!activeProjectId) {
        activeProjectId = nextProjectId
      }
    },
    async getActiveProjectId() {
      return activeProjectId
    },
    async setActiveProjectId(projectId: string) {
      if (hasProject(projects, projectId)) {
        activeProjectId = projectId
      }
    },
    async exportProjectManifest(projectId: string) {
      return readMemoryProjectManifest({ manifests, projectId, projects })
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

export { createMemoryProjectStorage }
