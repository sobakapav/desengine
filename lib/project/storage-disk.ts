import { mkdir, readdir, readFile, stat, writeFile } from "node:fs/promises"
import { homedir } from "node:os"
import path from "node:path"

import type { ProjectComponent } from "@/lib/project/component-runtime"
import { createProjectComponent, normalizeProjectComponent } from "@/lib/project/component-runtime"
import {
  exportProjectManifest,
  importProjectManifest,
  type ProjectManifest,
  type RawProjectManifest,
} from "@/lib/project/manifest"
import {
  normalizeProjectMetadata,
  type RawProjectMetadata,
} from "@/lib/project/metadata-contract"
import {
  createProjectWorkspace,
  serializeProjectWorkspace,
  type RawProject,
  type CreateProjectWorkspaceInput,
  type ProjectWorkspace,
} from "@/lib/project/runtime"
import { hasProject, mergeProject, removeProject, resolvePreviousProjectId } from "@/lib/project/storage-shared"
import type { ProjectStorage } from "@/lib/project/storage-types"
import {
  createProjectSession,
  createProjectWorkspaceActivity,
  normalizeProjectSession,
  normalizeProjectWorkspaceActivity,
  type ProjectSession,
  type ProjectWorkspaceActivity,
} from "@/lib/project/workspace-session"
import { buildProjectWorkspaceSnapshot, syncProjectSession, type ProjectWorkspaceSnapshot } from "@/lib/project/workspace-snapshot"

type ProjectRegistryEntry = {
  id: string
  rootPath: string
}

type ProjectRegistryDocument = {
  version: "1"
  activeProjectId: string | null
  entries: ProjectRegistryEntry[]
}

type DiskProjectStorage = ProjectStorage & {
  connectProject(rootPath: string): Promise<ProjectWorkspace>
  readWorkspaceSnapshot(projectId: string): Promise<ProjectWorkspaceSnapshot | null>
}

const PROJECT_STORAGE_VERSION = "1"
const PROJECT_FILE_NAME = "project.json"
const PROJECT_METADATA_FILE_NAME = "project-metadata.json"
const COMPONENTS_DIR_NAME = "components"
const WORKSPACE_DIR_NAME = "workspace"
const SESSION_FILE_NAME = "session.json"
const ACTIVITIES_FILE_NAME = "activities.json"
const ARTIFACTS_DIR_NAME = "artifacts"
const METADATA_DIR_NAME = "metadata"
const SOURCES_DIR_NAME = "sources"
const FIGMA_DIR_NAME = "figma"
const STRUCTURE_DIR_NAME = "structure"
const ARCHIVE_DIR_NAME = "archive"
const ARCHIVE_ANALYTICS_DIR_NAME = "analytics"
const ARCHIVE_REQUIREMENTS_DIR_NAME = "requirements"

function getProductRootPath() {
  return path.resolve(/*turbopackIgnore: true*/ process.cwd())
}

function isInsideDirectory(rootPath: string, candidatePath: string) {
  const resolvedRoot = path.resolve(rootPath)
  const resolvedCandidate = path.resolve(candidatePath)
  return resolvedCandidate === resolvedRoot || resolvedCandidate.startsWith(`${resolvedRoot}${path.sep}`)
}

function assertPathOutsideProductRoot(candidatePath: string) {
  const productRootPath = getProductRootPath()
  if (isInsideDirectory(productRootPath, candidatePath)) {
    throw new Error("Проект нельзя хранить внутри папки продукта. Укажите другой server path.")
  }
}

function normalizeAbsoluteServerPath(rawPath: string, subjectLabel: string) {
  if (typeof rawPath !== "string" || !rawPath.trim()) {
    throw new Error(`Нужен абсолютный server path для ${subjectLabel}.`)
  }

  const trimmedPath = rawPath.trim()
  if (!path.isAbsolute(trimmedPath)) {
    throw new Error(`Server path для ${subjectLabel} должен быть абсолютным.`)
  }
  const resolvedPath = path.resolve(trimmedPath)

  assertPathOutsideProductRoot(resolvedPath)
  return resolvedPath
}

function resolveProjectRegistryPath() {
  const configuredPath = process.env.DESENGINE_PROJECT_REGISTRY_PATH?.trim()
  const registryPath = configuredPath
    ? path.resolve(configuredPath)
    : path.join(homedir(), ".desengine", "projects", "registry.json")

  assertPathOutsideProductRoot(registryPath)
  return registryPath
}

function getProjectFilePath(rootPath: string) {
  return path.join(rootPath, PROJECT_FILE_NAME)
}

function getProjectMetadataFilePath(rootPath: string) {
  return path.join(rootPath, PROJECT_METADATA_FILE_NAME)
}

function getProjectMetadataDirPath(rootPath: string) {
  return path.join(rootPath, METADATA_DIR_NAME)
}

function getProjectMetadataSummaryFilePath(rootPath: string) {
  return path.join(getProjectMetadataDirPath(rootPath), "project.json")
}

function getProjectSourcesDirPath(rootPath: string) {
  return path.join(rootPath, SOURCES_DIR_NAME)
}

function getProjectFigmaDirPath(rootPath: string) {
  return path.join(getProjectSourcesDirPath(rootPath), FIGMA_DIR_NAME)
}

function getProjectFigmaFilesPath(rootPath: string) {
  return path.join(getProjectFigmaDirPath(rootPath), "files.json")
}

function getProjectStructureDirPath(rootPath: string) {
  return path.join(rootPath, STRUCTURE_DIR_NAME)
}

function getProjectComponentGraphFilePath(rootPath: string) {
  return path.join(getProjectStructureDirPath(rootPath), "component-graph.json")
}

function getProjectScreenGraphFilePath(rootPath: string) {
  return path.join(getProjectStructureDirPath(rootPath), "screen-graph.json")
}

function getProjectArchiveDirPath(rootPath: string) {
  return path.join(rootPath, ARCHIVE_DIR_NAME)
}

function getProjectArchiveAnalyticsDirPath(rootPath: string) {
  return path.join(getProjectArchiveDirPath(rootPath), ARCHIVE_ANALYTICS_DIR_NAME)
}

function getProjectArchiveRequirementsDirPath(rootPath: string) {
  return path.join(getProjectArchiveDirPath(rootPath), ARCHIVE_REQUIREMENTS_DIR_NAME)
}

function getProjectComponentsDirPath(rootPath: string) {
  return path.join(rootPath, COMPONENTS_DIR_NAME)
}

function getProjectWorkspaceDirPath(rootPath: string) {
  return path.join(rootPath, WORKSPACE_DIR_NAME)
}

function getProjectSessionFilePath(rootPath: string) {
  return path.join(getProjectWorkspaceDirPath(rootPath), SESSION_FILE_NAME)
}

function getProjectActivitiesFilePath(rootPath: string) {
  return path.join(getProjectWorkspaceDirPath(rootPath), ACTIVITIES_FILE_NAME)
}

function getProjectArtifactsDirPath(rootPath: string) {
  return path.join(rootPath, ARTIFACTS_DIR_NAME)
}

function getDefaultImportedProjectsRootPath() {
  return path.join(path.dirname(resolveProjectRegistryPath()), "imports")
}

async function ensureParentDirectory(filePath: string) {
  await mkdir(path.dirname(filePath), { recursive: true })
}

async function writeJsonFile(filePath: string, value: unknown) {
  await ensureParentDirectory(filePath)
  await writeFile(filePath, JSON.stringify(value, null, 2), "utf8")
}

async function readJsonFile<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await readFile(filePath, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

async function pathExists(candidatePath: string) {
  try {
    await stat(candidatePath)
    return true
  } catch {
    return false
  }
}

async function ensureProjectLayout(rootPath: string) {
  await mkdir(rootPath, { recursive: true })
  await mkdir(getProjectComponentsDirPath(rootPath), { recursive: true })
  await mkdir(getProjectWorkspaceDirPath(rootPath), { recursive: true })
  await mkdir(getProjectArtifactsDirPath(rootPath), { recursive: true })
  await mkdir(getProjectMetadataDirPath(rootPath), { recursive: true })
  await mkdir(getProjectFigmaDirPath(rootPath), { recursive: true })
  await mkdir(getProjectStructureDirPath(rootPath), { recursive: true })
  await mkdir(getProjectArchiveAnalyticsDirPath(rootPath), { recursive: true })
  await mkdir(getProjectArchiveRequirementsDirPath(rootPath), { recursive: true })
}

function normalizeRegistryDocument(rawDocument: Partial<ProjectRegistryDocument> | null | undefined) {
  const entries = Array.isArray(rawDocument?.entries)
    ? rawDocument.entries
      .map((entry) => {
        const id = typeof entry?.id === "string" ? entry.id.trim() : ""
        const rootPath = typeof entry?.rootPath === "string" ? path.resolve(entry.rootPath.trim()) : ""
        if (!id || !rootPath) {
          return null
        }

        return { id, rootPath } satisfies ProjectRegistryEntry
      })
      .filter((entry): entry is ProjectRegistryEntry => entry !== null)
    : []

  const activeProjectId = typeof rawDocument?.activeProjectId === "string" && rawDocument.activeProjectId.trim()
    ? rawDocument.activeProjectId.trim()
    : null

  return {
    version: PROJECT_STORAGE_VERSION,
    activeProjectId,
    entries,
  } satisfies ProjectRegistryDocument
}

async function readProjectRegistryDocument() {
  return normalizeRegistryDocument(
    await readJsonFile<Partial<ProjectRegistryDocument> | null>(resolveProjectRegistryPath(), null),
  )
}

async function writeProjectRegistryDocument(document: ProjectRegistryDocument) {
  await writeJsonFile(resolveProjectRegistryPath(), normalizeRegistryDocument(document))
}

async function readProjectWorkspaceFromDisk(rootPath: string) {
  const rawProject = await readJsonFile<RawProject | null>(getProjectFilePath(rootPath), null)
  const legacyMetadata = await readJsonFile<RawProjectMetadata | null>(
    getProjectMetadataFilePath(rootPath),
    rawProject?.metadata ?? null,
  )
  const metadataSummary = await readJsonFile<RawProjectMetadata | null>(
    getProjectMetadataSummaryFilePath(rootPath),
    null,
  )
  const figmaFiles = await readJsonFile<RawProjectMetadata["figmaFiles"]>(
    getProjectFigmaFilesPath(rootPath),
    legacyMetadata?.figmaFiles ?? [],
  )
  const componentGraph = await readJsonFile<RawProjectMetadata["componentGraph"]>(
    getProjectComponentGraphFilePath(rootPath),
    legacyMetadata?.componentGraph ?? null,
  )
  const screenGraph = await readJsonFile<RawProjectMetadata["screenGraph"]>(
    getProjectScreenGraphFilePath(rootPath),
    legacyMetadata?.screenGraph ?? null,
  )
  const archive = await readArchiveMetadataFromDisk(rootPath, legacyMetadata)
  const rawMetadata = normalizeProjectMetadata({
    ...(legacyMetadata ?? {}),
    ...(metadataSummary ?? {}),
    figmaFiles,
    componentGraph,
    screenGraph,
    archive,
  }, {
    code: rawProject?.metadata?.code ?? rawProject?.id ?? "",
    title: rawProject?.title ?? "",
    uiKitId: rawProject?.settings?.uiKitId ?? rawProject?.uiKitId ?? "ant",
  })
  const workspace = serializeProjectWorkspace({
    ...(rawProject ?? {}),
    metadata: rawMetadata,
  })

  return workspace
}

async function writeProjectWorkspaceToDisk(rootPath: string, project: ProjectWorkspace) {
  await ensureProjectLayout(rootPath)
  const normalizedProject = serializeProjectWorkspace(project)
  const { metadata, ...projectDocument } = normalizedProject

  await Promise.all([
    writeJsonFile(getProjectFilePath(rootPath), projectDocument),
    writeJsonFile(getProjectMetadataFilePath(rootPath), metadata),
    writeJsonFile(getProjectMetadataSummaryFilePath(rootPath), {
      title: normalizedProject.title,
      code: metadata.code || normalizedProject.id,
      uiKitId: normalizedProject.settings.uiKitId,
      updatedAt: normalizedProject.updatedAt,
    }),
    writeJsonFile(getProjectFigmaFilesPath(rootPath), metadata.figmaFiles),
    writeJsonFile(getProjectComponentGraphFilePath(rootPath), metadata.componentGraph),
    writeJsonFile(getProjectScreenGraphFilePath(rootPath), metadata.screenGraph),
  ])
}

async function readArchiveMetadataFromDisk(rootPath: string, legacyMetadata: RawProjectMetadata | null) {
  const archiveRootPath = getProjectArchiveDirPath(rootPath)
  const fallbackEntries = legacyMetadata?.archive?.entries ?? []

  try {
    const groups = await readdir(archiveRootPath, { withFileTypes: true })
    const filesByGroup = await Promise.all(
      groups
        .filter((entry) => entry.isDirectory())
        .map(async (entry) => {
          const groupId = entry.name
          const groupPath = path.join(archiveRootPath, groupId)
          const groupEntries = await readdir(groupPath, { withFileTypes: true })

          return groupEntries
            .filter((item) => item.isFile())
            .map((item, index) => ({
              groupId,
              id: `${groupId}-${index + 1}`,
              kind: "document",
              path: path.posix.join(ARCHIVE_DIR_NAME, groupId, item.name),
              source: null,
              title: item.name,
              updatedAt: null,
            }))
        }),
    )

    return {
      entries: filesByGroup.flat(),
      updatedAt: legacyMetadata?.archive?.updatedAt ?? null,
    }
  } catch {
    return {
      entries: fallbackEntries,
      updatedAt: legacyMetadata?.archive?.updatedAt ?? null,
    }
  }
}

function getComponentFilePath(rootPath: string, componentId: string) {
  return path.join(
    getProjectComponentsDirPath(rootPath),
    `${encodeURIComponent(componentId)}.json`,
  )
}

async function listProjectComponentsFromDisk(rootPath: string) {
  const componentsDirPath = getProjectComponentsDirPath(rootPath)
  const directoryExists = await pathExists(componentsDirPath)
  if (!directoryExists) {
    return [] as ProjectComponent[]
  }

  const fileNames = await readdir(componentsDirPath)
  const components = await Promise.all(
    fileNames
      .filter((fileName) => fileName.endsWith(".json"))
      .map(async (fileName) => normalizeProjectComponent(
        await readJsonFile<ProjectComponent | null>(path.join(componentsDirPath, fileName), null),
      )),
  )

  return components
    .filter((component) => component.projectId.trim().length > 0)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
}

async function writeProjectComponentToDisk(rootPath: string, component: ProjectComponent) {
  await ensureProjectLayout(rootPath)
  await writeJsonFile(
    getComponentFilePath(rootPath, component.id),
    normalizeProjectComponent(component),
  )
}

async function readProjectSessionFromDisk(rootPath: string, projectId: string) {
  return normalizeProjectSession(
    await readJsonFile<ProjectSession | null>(getProjectSessionFilePath(rootPath), null),
    projectId,
  )
}

async function writeProjectSessionToDisk(rootPath: string, session: ProjectSession) {
  await ensureProjectLayout(rootPath)
  await writeJsonFile(
    getProjectSessionFilePath(rootPath),
    normalizeProjectSession(session, session.projectId),
  )
}

async function listProjectActivitiesFromDisk(rootPath: string, projectId: string) {
  const activities = await readJsonFile<ProjectWorkspaceActivity[] | null>(
    getProjectActivitiesFilePath(rootPath),
    [],
  )

  if (!Array.isArray(activities)) {
    return [] as ProjectWorkspaceActivity[]
  }

  return activities
    .map((activity) => normalizeProjectWorkspaceActivity(activity, projectId))
    .filter((activity): activity is ProjectWorkspaceActivity => activity !== null)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

async function writeProjectActivitiesToDisk(rootPath: string, activities: ProjectWorkspaceActivity[]) {
  await ensureProjectLayout(rootPath)
  await writeJsonFile(getProjectActivitiesFilePath(rootPath), activities)
}

async function appendProjectActivityToDisk(rootPath: string, projectId: string, activity: ProjectWorkspaceActivity) {
  const activities = await listProjectActivitiesFromDisk(rootPath, projectId)
  await writeProjectActivitiesToDisk(rootPath, [activity, ...activities])
}

async function readProjectsFromRegistry() {
  const registry = await readProjectRegistryDocument()
  const projects: ProjectWorkspace[] = []
  const entries: ProjectRegistryEntry[] = []

  for (const entry of registry.entries) {
    if (!await pathExists(getProjectFilePath(entry.rootPath))) {
      continue
    }

    const project = await readProjectWorkspaceFromDisk(entry.rootPath)
    projects.push(project)
    entries.push({
      id: project.id,
      rootPath: entry.rootPath,
    })
  }

  return {
    registry: {
      ...registry,
      entries,
      activeProjectId: hasProject(projects, registry.activeProjectId) ? registry.activeProjectId : projects[0]?.id ?? null,
    } satisfies ProjectRegistryDocument,
    projects,
  }
}

function resolveProjectRootPath(args: {
  entries: ProjectRegistryEntry[]
  projectId: string
  previousProjectId?: string | null
}) {
  const preferredIds = [
    args.previousProjectId?.trim() || null,
    args.projectId.trim(),
  ].filter((value): value is string => Boolean(value))

  for (const candidateId of preferredIds) {
    const matchedEntry = args.entries.find((entry) => entry.id === candidateId)
    if (matchedEntry) {
      return matchedEntry.rootPath
    }
  }

  return null
}

async function createDiskProject(args: {
  input: CreateProjectWorkspaceInput & { rootPath?: string | null }
  registry: ProjectRegistryDocument
}) {
  const rootPath = normalizeAbsoluteServerPath(args.input.rootPath ?? "", "нового проекта")
  const existingProjectFilePath = getProjectFilePath(rootPath)

  if (await pathExists(existingProjectFilePath)) {
    throw new Error("По этому пути уже найден проект. Используйте подключение внешнего проекта.")
  }

  const project = createProjectWorkspace(args.input)
  await ensureProjectLayout(rootPath)
  await writeProjectWorkspaceToDisk(rootPath, project)
  await writeProjectSessionToDisk(rootPath, createProjectSession(project.id))
  await writeProjectActivitiesToDisk(rootPath, [])

  const nextEntries = [
    ...args.registry.entries.filter((entry) => entry.id !== project.id),
    { id: project.id, rootPath },
  ]

  await writeProjectRegistryDocument({
    version: PROJECT_STORAGE_VERSION,
    activeProjectId: project.id,
    entries: nextEntries,
  })

  return project
}

async function connectDiskProject(rootPath: string, registry: ProjectRegistryDocument) {
  const normalizedRootPath = normalizeAbsoluteServerPath(rootPath, "подключаемого проекта")
  const projectFilePath = getProjectFilePath(normalizedRootPath)
  if (!await pathExists(projectFilePath)) {
    throw new Error("По указанному пути не найден `project.json` desengine-проекта.")
  }

  const project = await readProjectWorkspaceFromDisk(normalizedRootPath)
  await ensureProjectLayout(normalizedRootPath)

  await writeProjectRegistryDocument({
    version: PROJECT_STORAGE_VERSION,
    activeProjectId: project.id,
    entries: [
      ...registry.entries.filter((entry) => entry.id !== project.id && entry.rootPath !== normalizedRootPath),
      { id: project.id, rootPath: normalizedRootPath },
    ],
  })

  return project
}

async function buildProjectWorkspaceSnapshotFromDisk(rootPath: string, project: ProjectWorkspace) {
  const [components, rawSession, activities] = await Promise.all([
    listProjectComponentsFromDisk(rootPath),
    readProjectSessionFromDisk(rootPath, project.id),
    listProjectActivitiesFromDisk(rootPath, project.id),
  ])

  const syncedSession = syncProjectSession({
    activities,
    components,
    project,
    session: rawSession,
  })

  if (
    syncedSession.status !== rawSession.status
    || syncedSession.lastActivityAt !== rawSession.lastActivityAt
    || syncedSession.updatedAt !== rawSession.updatedAt
  ) {
    await writeProjectSessionToDisk(rootPath, syncedSession)
  }

  return buildProjectWorkspaceSnapshot({
    activities,
    components,
    project,
    session: syncedSession,
  })
}

function resolveImportedProjectRootPath(projectId: string) {
  return path.join(getDefaultImportedProjectsRootPath(), projectId)
}

function createServerProjectStorage(): DiskProjectStorage {
  return {
    async listProjects() {
      const { projects, registry } = await readProjectsFromRegistry()
      if (registry.entries.length !== (await readProjectRegistryDocument()).entries.length) {
        await writeProjectRegistryDocument(registry)
      }
      return projects
    },
    async getProject(projectId: string) {
      const { projects } = await readProjectsFromRegistry()
      return projects.find((project) => project.id === projectId) ?? null
    },
    async getActiveProject() {
      const { projects, registry } = await readProjectsFromRegistry()
      return projects.find((project) => project.id === registry.activeProjectId) ?? null
    },
    async createProject(input) {
      const { registry } = await readProjectsFromRegistry()
      return createDiskProject({
        input: input as CreateProjectWorkspaceInput & { rootPath?: string | null },
        registry,
      })
    },
    async saveProject(project, previousProjectId) {
      const normalizedProject = serializeProjectWorkspace(project)
      const { registry, projects } = await readProjectsFromRegistry()
      const rootPath = resolveProjectRootPath({
        entries: registry.entries,
        projectId: normalizedProject.id,
        previousProjectId,
      })

      if (!rootPath) {
        throw new Error("Не удалось определить server path проекта для сохранения.")
      }

      await writeProjectWorkspaceToDisk(rootPath, normalizedProject)

      const nextProjectId = normalizedProject.id
      const nextProjects = mergeProject(
        removeProject(projects, resolvePreviousProjectId(previousProjectId, nextProjectId)),
        normalizedProject,
      )
      const nextEntries = [
        ...registry.entries.filter((entry) => entry.id !== nextProjectId && entry.id !== previousProjectId),
        { id: nextProjectId, rootPath },
      ]

      await writeProjectRegistryDocument({
        version: PROJECT_STORAGE_VERSION,
        activeProjectId: registry.activeProjectId === previousProjectId ? nextProjectId : registry.activeProjectId,
        entries: nextEntries,
      })

      if (!hasProject(nextProjects, normalizedProject.id)) {
        throw new Error("Не удалось обновить registry проекта.")
      }
    },
    async getActiveProjectId() {
      const { registry } = await readProjectsFromRegistry()
      return registry.activeProjectId
    },
    async setActiveProjectId(projectId) {
      const { projects, registry } = await readProjectsFromRegistry()
      if (!hasProject(projects, projectId)) {
        return
      }

      await writeProjectRegistryDocument({
        ...registry,
        activeProjectId: projectId,
      })
    },
    async exportProjectManifest(projectId) {
      const { registry } = await readProjectsFromRegistry()
      const rootPath = resolveProjectRootPath({
        entries: registry.entries,
        projectId,
      })

      if (!rootPath) {
        return null
      }

      const project = await readProjectWorkspaceFromDisk(rootPath)
      const snapshot = await buildProjectWorkspaceSnapshotFromDisk(rootPath, project)

      return exportProjectManifest({
        activities: snapshot.activities,
        components: snapshot.components,
        project,
        session: snapshot.session,
      })
    },
    async importProjectManifest(manifest) {
      const imported = importProjectManifest(manifest)
      const { registry } = await readProjectsFromRegistry()
      const existingRootPath = resolveProjectRootPath({
        entries: registry.entries,
        projectId: imported.project.id,
      })
      const rootPath = existingRootPath ?? resolveImportedProjectRootPath(imported.project.id)

      await ensureProjectLayout(rootPath)
      await writeProjectWorkspaceToDisk(rootPath, imported.project)
      await writeProjectActivitiesToDisk(rootPath, [])
      await Promise.all(imported.components.map((component) => writeProjectComponentToDisk(rootPath, component)))
      await writeProjectSessionToDisk(
        rootPath,
        normalizeProjectSession({
          projectId: imported.project.id,
          workflowKind: "project-design-workflow",
          status: imported.components.length > 0 ? "in_progress" : "idle",
          createdAt: imported.project.createdAt,
          updatedAt: imported.project.updatedAt,
          lastActivityAt: imported.artifactsSummary.lastActivityAt,
        }, imported.project.id),
      )

      await writeProjectRegistryDocument({
        version: PROJECT_STORAGE_VERSION,
        activeProjectId: imported.project.id,
        entries: [
          ...registry.entries.filter((entry) => entry.id !== imported.project.id),
          { id: imported.project.id, rootPath },
        ],
      })

      return imported
    },
    async connectProject(rootPath) {
      const { registry } = await readProjectsFromRegistry()
      return connectDiskProject(rootPath, registry)
    },
    async readWorkspaceSnapshot(projectId) {
      const { registry } = await readProjectsFromRegistry()
      const rootPath = resolveProjectRootPath({
        entries: registry.entries,
        projectId,
      })

      if (!rootPath) {
        return null
      }

      const project = await readProjectWorkspaceFromDisk(rootPath)
      return buildProjectWorkspaceSnapshotFromDisk(rootPath, project)
    },
  }
}

async function createProjectComponentInStorage(args: {
  projectId: string
  title: string
}) {
  const storage = createServerProjectStorage()
  const project = await storage.getProject(args.projectId)
  if (!project) {
    throw new Error("Не удалось найти проект для добавления компонента.")
  }

  const registry = await readProjectRegistryDocument()
  const rootPath = resolveProjectRootPath({
    entries: registry.entries,
    projectId: args.projectId,
  })

  if (!rootPath) {
    throw new Error("Не удалось определить server path проекта для добавления компонента.")
  }

  const component = createProjectComponent({
    projectId: args.projectId,
    title: args.title,
    workflowKind: "image-to-component-workflow",
  })
  await writeProjectComponentToDisk(rootPath, component)
  await appendProjectActivityToDisk(rootPath, args.projectId, createProjectWorkspaceActivity({
    kind: "project-component-created",
    message: `В проект добавлен компонент «${component.title}».`,
    projectId: args.projectId,
    componentId: component.id,
    componentTitle: component.title,
  }))

  return component
}

async function updateProjectComponentStatusInStorage(args: {
  componentId: string
  kind: "project-component-completed" | "project-component-reopened" | "project-component-started"
  message: (title: string) => string
  nextStatus: ProjectComponent["status"]
  projectId: string
}) {
  const registry = await readProjectRegistryDocument()
  const rootPath = resolveProjectRootPath({
    entries: registry.entries,
    projectId: args.projectId,
  })

  if (!rootPath) {
    throw new Error("Не удалось определить server path проекта.")
  }

  const components = await listProjectComponentsFromDisk(rootPath)
  const component = components.find((item) => item.id === args.componentId) ?? null

  if (!component) {
    throw new Error("Не удалось найти компонент проекта.")
  }

  const nextComponent = normalizeProjectComponent({
    ...component,
    status: args.nextStatus,
    updatedAt: new Date().toISOString(),
  })
  await writeProjectComponentToDisk(rootPath, nextComponent)
  await appendProjectActivityToDisk(rootPath, args.projectId, createProjectWorkspaceActivity({
    kind: args.kind,
    message: args.message(component.title),
    projectId: args.projectId,
    componentId: component.id,
    componentTitle: component.title,
  }))

  return nextComponent
}

async function updateProjectSessionStatusInStorage(projectId: string, status: ProjectSession["status"]) {
  const registry = await readProjectRegistryDocument()
  const rootPath = resolveProjectRootPath({
    entries: registry.entries,
    projectId,
  })

  if (!rootPath) {
    throw new Error("Не удалось определить server path проекта.")
  }

  const session = await readProjectSessionFromDisk(rootPath, projectId)
  const nextSession = normalizeProjectSession({
    ...session,
    status,
    updatedAt: new Date().toISOString(),
    lastActivityAt: new Date().toISOString(),
  }, projectId)
  await writeProjectSessionToDisk(rootPath, nextSession)
  return { rootPath, session: nextSession }
}

async function runProjectWorkspaceAction(args: {
  action:
    | { type: "start-project-work" }
    | { type: "create-component"; title: string }
    | { type: "start-component-work"; componentId: string }
    | { type: "complete-component"; componentId: string }
    | { type: "reopen-component"; componentId: string }
  projectId: string
}) {
  switch (args.action.type) {
    case "start-project-work": {
      const { rootPath } = await updateProjectSessionStatusInStorage(args.projectId, "in_progress")
      await appendProjectActivityToDisk(rootPath, args.projectId, createProjectWorkspaceActivity({
        kind: "project-session-started",
        message: "Запущена работа над проектом.",
        projectId: args.projectId,
      }))
      break
    }
    case "create-component":
      await createProjectComponentInStorage({
        projectId: args.projectId,
        title: args.action.title,
      })
      break
    case "start-component-work": {
      await updateProjectSessionStatusInStorage(args.projectId, "in_progress")
      await updateProjectComponentStatusInStorage({
        componentId: args.action.componentId,
        kind: "project-component-started",
        message: (title) => `По компоненту «${title}» запущена активная линия работы проекта.`,
        nextStatus: "in_progress",
        projectId: args.projectId,
      })
      break
    }
    case "complete-component":
      await updateProjectComponentStatusInStorage({
        componentId: args.action.componentId,
        kind: "project-component-completed",
        message: (title) => `Компонент «${title}» отмечен как готовый внутри проекта.`,
        nextStatus: "completed",
        projectId: args.projectId,
      })
      break
    case "reopen-component": {
      await updateProjectSessionStatusInStorage(args.projectId, "in_progress")
      await updateProjectComponentStatusInStorage({
        componentId: args.action.componentId,
        kind: "project-component-reopened",
        message: (title) => `Компонент «${title}» возвращён в активную работу проекта.`,
        nextStatus: "in_progress",
        projectId: args.projectId,
      })
      break
    }
  }

  return createServerProjectStorage().readWorkspaceSnapshot(args.projectId)
}

async function readProjectRootPath(projectId: string) {
  const { registry } = await readProjectsFromRegistry()
  return resolveProjectRootPath({
    entries: registry.entries,
    projectId,
  })
}

export {
  createServerProjectStorage,
  normalizeAbsoluteServerPath,
  readProjectRootPath,
  resolveProjectRegistryPath,
  runProjectWorkspaceAction,
}

export type {
  DiskProjectStorage,
  ProjectRegistryDocument,
  ProjectRegistryEntry,
}
