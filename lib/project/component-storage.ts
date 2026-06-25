import {
  createProjectComponent,
  normalizeProjectComponent,
  type CreateProjectComponentInput,
  type ProjectComponent,
} from "@/lib/project/component-runtime"

type ProjectComponentStorage = {
  listComponents(projectId: string): Promise<ProjectComponent[]>
  getComponent(projectId: string, componentId: string): Promise<ProjectComponent | null>
  createComponent(input: CreateProjectComponentInput): Promise<ProjectComponent>
  saveComponent(component: ProjectComponent): Promise<void>
}

const PROJECT_COMPONENTS_STORAGE_KEY = "desengine:project-components"

function getProjectComponentsStorageKey(projectId: string) {
  return `${PROJECT_COMPONENTS_STORAGE_KEY}:${projectId}`
}

function normalizeProjectComponentList(rawList: unknown): ProjectComponent[] {
  if (!Array.isArray(rawList)) {
    return []
  }

  return rawList
    .map((item) => normalizeProjectComponent(item as ProjectComponent))
    .filter((item) => item.projectId.trim().length > 0)
}

function mergeProjectComponent(components: ProjectComponent[], component: ProjectComponent) {
  const normalized = normalizeProjectComponent(component)
  const existingIndex = components.findIndex((item) => item.id === normalized.id)

  if (existingIndex >= 0) {
    return components.map((item, index) => (index === existingIndex ? normalized : item))
  }

  return [...components, normalized]
}

function sortProjectComponents(components: ProjectComponent[]) {
  return [...components].sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

function readStorageJson(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function createBrowserProjectComponentStorage(storage: Storage): ProjectComponentStorage {
  function readComponents(projectId: string) {
    return normalizeProjectComponentList(readStorageJson(storage, getProjectComponentsStorageKey(projectId)))
  }

  function writeComponents(projectId: string, components: ProjectComponent[]) {
    storage.setItem(
      getProjectComponentsStorageKey(projectId),
      JSON.stringify(sortProjectComponents(components)),
    )
  }

  return {
    async listComponents(projectId: string) {
      return sortProjectComponents(readComponents(projectId))
    },
    async getComponent(projectId: string, componentId: string) {
      return readComponents(projectId).find((component) => component.id === componentId) ?? null
    },
    async createComponent(input: CreateProjectComponentInput) {
      const component = createProjectComponent(input)
      const components = readComponents(component.projectId)
      writeComponents(component.projectId, mergeProjectComponent(components, component))
      return component
    },
    async saveComponent(component: ProjectComponent) {
      const normalized = normalizeProjectComponent({
        ...component,
        updatedAt: new Date().toISOString(),
      })
      const components = readComponents(normalized.projectId)
      writeComponents(normalized.projectId, mergeProjectComponent(components, normalized))
    },
  }
}

function createMemoryProjectComponentStorage(
  initialComponents: ProjectComponent[] = [],
): ProjectComponentStorage {
  const componentsByProjectId = new Map<string, ProjectComponent[]>()

  for (const component of initialComponents.map(normalizeProjectComponent)) {
    const currentComponents = componentsByProjectId.get(component.projectId) ?? []
    componentsByProjectId.set(component.projectId, mergeProjectComponent(currentComponents, component))
  }

  return {
    async listComponents(projectId: string) {
      return sortProjectComponents(componentsByProjectId.get(projectId) ?? [])
    },
    async getComponent(projectId: string, componentId: string) {
      return (componentsByProjectId.get(projectId) ?? []).find((component) => component.id === componentId) ?? null
    },
    async createComponent(input: CreateProjectComponentInput) {
      const component = createProjectComponent(input)
      const currentComponents = componentsByProjectId.get(component.projectId) ?? []
      componentsByProjectId.set(component.projectId, mergeProjectComponent(currentComponents, component))
      return component
    },
    async saveComponent(component: ProjectComponent) {
      const normalized = normalizeProjectComponent({
        ...component,
        updatedAt: new Date().toISOString(),
      })
      const currentComponents = componentsByProjectId.get(normalized.projectId) ?? []
      componentsByProjectId.set(normalized.projectId, mergeProjectComponent(currentComponents, normalized))
    },
  }
}

export {
  PROJECT_COMPONENTS_STORAGE_KEY,
  createBrowserProjectComponentStorage,
  createMemoryProjectComponentStorage,
  getProjectComponentsStorageKey,
}

export type { ProjectComponentStorage }
