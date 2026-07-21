import { readdir, readFile } from "node:fs/promises"
import path from "node:path"

import type { ProjectWorkspace } from "@/lib/project/runtime"

type ProjectSurfaceMetadata = {
  title: string
  code: string
  uiKitId: ProjectWorkspace["settings"]["uiKitId"]
  storagePath: string | null
}

type ProjectSurfaceFigmaFile = {
  id: string
  title: string
  url: string | null
  status: string | null
  notes: string | null
}

type ProjectSurfaceGraph = {
  nodeCount: number
  edgeCount: number
  storagePath: string | null
}

type ProjectSurfaceArchiveFile = {
  path: string
  title: string
}

type ProjectSurfaceArchiveGroup = {
  id: string
  title: string
  fileCount: number
  storagePath: string | null
  files: ProjectSurfaceArchiveFile[]
}

type ProjectSurfaceSummary = {
  metadata: ProjectSurfaceMetadata
  figmaFiles: ProjectSurfaceFigmaFile[]
  componentGraph: ProjectSurfaceGraph
  screenGraph: ProjectSurfaceGraph
  archiveGroups: ProjectSurfaceArchiveGroup[]
}

const METADATA_FILE_CANDIDATES = [
  "metadata/project.json",
  "metadata/project-metadata.json",
  "metadata.json",
] as const

const FIGMA_FILE_CANDIDATES = [
  "sources/figma/files.json",
  "sources/figma/figma-files.json",
  "sources/figma.json",
] as const

const COMPONENT_GRAPH_CANDIDATES = [
  "structure/component-graph.json",
  "structure/componentGraph.json",
  "structure/components.json",
] as const

const SCREEN_GRAPH_CANDIDATES = [
  "structure/screen-graph.json",
  "structure/screenGraph.json",
  "structure/screens.json",
] as const

function readString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null
}

function readObject(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

async function readJsonIfExists<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await readFile(filePath, "utf8")
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

async function resolveFirstExistingJson<T>(rootPath: string, candidates: readonly string[]) {
  for (const relativePath of candidates) {
    const absolutePath = path.join(rootPath, relativePath)
    const json = await readJsonIfExists<T>(absolutePath)
    if (json !== null) {
      return {
        json,
        storagePath: relativePath,
      }
    }
  }

  return {
    json: null,
    storagePath: null,
  }
}

function normalizeProjectMetadata(args: {
  project: ProjectWorkspace
  rawMetadata: unknown
  storagePath: string | null
}): ProjectSurfaceMetadata {
  const metadataRecord = readObject(args.rawMetadata)
  const nestedMetadataRecord = readObject(metadataRecord?.metadata)
  const projectRecord = readObject(metadataRecord?.project)
  const projectSettingsRecord = readObject(projectRecord?.settings)

  return {
    title:
      readString(metadataRecord?.title)
      ?? readString(nestedMetadataRecord?.title)
      ?? readString(projectRecord?.title)
      ?? args.project.title,
    code:
      readString(metadataRecord?.code)
      ?? readString(nestedMetadataRecord?.code)
      ?? readString(projectRecord?.code)
      ?? args.project.id,
    uiKitId:
      (readString(metadataRecord?.uiKitId)
        ?? readString(nestedMetadataRecord?.uiKitId)
        ?? readString(projectRecord?.uiKitId)
        ?? readString(projectSettingsRecord?.uiKitId)
        ?? args.project.settings.uiKitId) as ProjectWorkspace["settings"]["uiKitId"],
    storagePath: args.storagePath,
  }
}

function normalizeFigmaFile(item: unknown, index: number): ProjectSurfaceFigmaFile | null {
  const record = readObject(item)
  if (!record) {
    return null
  }

  const id =
    readString(record.id)
    ?? readString(record.key)
    ?? readString(record.fileKey)
    ?? readString(record.url)
    ?? `figma-${index + 1}`

  return {
    id,
    title:
      readString(record.title)
      ?? readString(record.name)
      ?? readString(record.fileName)
      ?? id,
    url: readString(record.url) ?? readString(record.href),
    status: readString(record.status) ?? readString(record.connectionStatus),
    notes: readString(record.notes) ?? readString(record.note),
  }
}

function normalizeFigmaFiles(rawValue: unknown) {
  if (Array.isArray(rawValue)) {
    return rawValue
      .map((item, index) => normalizeFigmaFile(item, index))
      .filter((item): item is ProjectSurfaceFigmaFile => item !== null)
  }

  const record = readObject(rawValue)
  const nestedList = Array.isArray(record?.figmaFiles)
    ? record.figmaFiles
    : Array.isArray(record?.files)
      ? record.files
      : Array.isArray(record?.items)
        ? record.items
        : []

  return nestedList
    .map((item, index) => normalizeFigmaFile(item, index))
    .filter((item): item is ProjectSurfaceFigmaFile => item !== null)
}

function normalizeGraph(rawValue: unknown, storagePath: string | null): ProjectSurfaceGraph {
  const record = readObject(rawValue)
  const graphRecord = readObject(record?.graph) ?? record
  const nodes = Array.isArray(graphRecord?.nodes) ? graphRecord.nodes : []
  const edges = Array.isArray(graphRecord?.edges) ? graphRecord.edges : []

  return {
    nodeCount: nodes.length,
    edgeCount: edges.length,
    storagePath,
  }
}

function toArchiveFileTitle(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").trim() || fileName
}

async function listArchiveGroupFiles(rootPath: string, groupId: string) {
  const groupPath = path.join(rootPath, "archive", groupId)

  try {
    const entries = await readdir(groupPath, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => ({
        path: path.posix.join("archive", groupId, entry.name),
        title: toArchiveFileTitle(entry.name),
      }))
      .sort((left, right) => left.path.localeCompare(right.path))
  } catch {
    return [] as ProjectSurfaceArchiveFile[]
  }
}

async function listArchiveGroups(rootPath: string) {
  const archivePath = path.join(rootPath, "archive")
  const baseGroups = [
    { id: "analytics", title: "Аналитика" },
    { id: "requirements", title: "Требования и ТЗ" },
  ]

  let dynamicGroups: Array<{ id: string; title: string }> = []
  try {
    const entries = await readdir(archivePath, { withFileTypes: true })
    dynamicGroups = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => ({
        id: entry.name,
        title: entry.name.replace(/[-_]+/g, " ").trim() || entry.name,
      }))
  } catch {
    dynamicGroups = []
  }

  const groups = new Map<string, { id: string; title: string }>()
  for (const group of [...baseGroups, ...dynamicGroups]) {
    groups.set(group.id, group)
  }

  return Promise.all(
    [...groups.values()].map(async (group) => {
      const files = await listArchiveGroupFiles(rootPath, group.id)
      return {
        id: group.id,
        title: group.title,
        fileCount: files.length,
        storagePath: files.length > 0 ? path.posix.join("archive", group.id) : null,
        files,
      } satisfies ProjectSurfaceArchiveGroup
    }),
  )
}

async function readProjectSurfaceSummary(rootPath: string, project: ProjectWorkspace): Promise<ProjectSurfaceSummary> {
  const [metadataResult, figmaResult, componentGraphResult, screenGraphResult, archiveGroups] = await Promise.all([
    resolveFirstExistingJson(rootPath, METADATA_FILE_CANDIDATES),
    resolveFirstExistingJson(rootPath, FIGMA_FILE_CANDIDATES),
    resolveFirstExistingJson(rootPath, COMPONENT_GRAPH_CANDIDATES),
    resolveFirstExistingJson(rootPath, SCREEN_GRAPH_CANDIDATES),
    listArchiveGroups(rootPath),
  ])

  return {
    metadata: normalizeProjectMetadata({
      project,
      rawMetadata: metadataResult.json,
      storagePath: metadataResult.storagePath,
    }),
    figmaFiles: normalizeFigmaFiles(figmaResult.json),
    componentGraph: normalizeGraph(componentGraphResult.json, componentGraphResult.storagePath),
    screenGraph: normalizeGraph(screenGraphResult.json, screenGraphResult.storagePath),
    archiveGroups,
  }
}

export {
  readProjectSurfaceSummary,
}

export type {
  ProjectSurfaceArchiveFile,
  ProjectSurfaceArchiveGroup,
  ProjectSurfaceFigmaFile,
  ProjectSurfaceGraph,
  ProjectSurfaceMetadata,
  ProjectSurfaceSummary,
}
