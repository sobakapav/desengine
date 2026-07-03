import type { CreateProjectWorkspaceInput, ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectManifest, RawProjectManifest } from "@/lib/project/manifest"

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

export {
  ACTIVE_PROJECT_ID_STORAGE_KEY,
  PROJECT_REGISTRY_STORAGE_KEY,
  type BrowserProjectStorageOptions,
  type ProjectStorage,
}
