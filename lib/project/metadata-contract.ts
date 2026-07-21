import type { ProjectUiKitId } from "@/lib/project/ui-kit-config"
import { normalizeOptionalProjectTimestamp } from "@/lib/project/runtime-helpers"

type ProjectFigmaFile = {
  id: string
  fileKey: string | null
  nodeId: string | null
  notes: string | null
  status: string | null
  title: string
  updatedAt: string | null
  url: string
}

type ProjectGraphNode = {
  id: string
  kind: string
  sourceId: string | null
  title: string
}

type ProjectGraphEdge = {
  from: string
  kind: string
  label: string
  to: string
}

type ProjectGraph = {
  edges: ProjectGraphEdge[]
  nodes: ProjectGraphNode[]
  updatedAt: string | null
}

type ProjectArchiveEntry = {
  groupId: string
  id: string
  kind: string
  path: string
  source: string | null
  title: string
  updatedAt: string | null
}

type ProjectArchive = {
  entries: ProjectArchiveEntry[]
  updatedAt: string | null
}

type ProjectMetadata = {
  archive: ProjectArchive
  code: string
  componentGraph: ProjectGraph
  figmaFiles: ProjectFigmaFile[]
  screenGraph: ProjectGraph
  title: string
  uiKitId: ProjectUiKitId
}

type RawProjectFigmaFile = Partial<ProjectFigmaFile> | null | undefined
type RawProjectGraphNode = Partial<ProjectGraphNode> | null | undefined
type RawProjectGraphEdge = Partial<ProjectGraphEdge> | null | undefined
type RawProjectGraph = Partial<{
  edges: RawProjectGraphEdge[] | null
  nodes: RawProjectGraphNode[] | null
  updatedAt: string | null
}> | null | undefined
type RawProjectArchiveEntry = Partial<ProjectArchiveEntry> | null | undefined
type RawProjectArchive = Partial<{
  entries: RawProjectArchiveEntry[] | null
  updatedAt: string | null
}> | null | undefined
type RawProjectMetadata = Partial<{
  archive: RawProjectArchive
  code: string | null
  componentGraph: RawProjectGraph
  figmaFiles: RawProjectFigmaFile[] | null
  screenGraph: RawProjectGraph
  title: string | null
  uiKitId: string | null
}> | null | undefined

function normalizeTrimmedString(value: string | null | undefined) {
  return typeof value === "string" ? value.trim() : ""
}

function normalizeNullableTrimmedString(value: string | null | undefined) {
  const normalized = normalizeTrimmedString(value)
  return normalized.length > 0 ? normalized : null
}

function createEmptyProjectGraph(): ProjectGraph {
  return {
    nodes: [],
    edges: [],
    updatedAt: null,
  }
}

function createEmptyProjectArchive(): ProjectArchive {
  return {
    entries: [],
    updatedAt: null,
  }
}

function createEmptyProjectMetadata(): ProjectMetadata {
  return {
    title: "",
    code: "",
    uiKitId: "ant",
    figmaFiles: [],
    componentGraph: createEmptyProjectGraph(),
    screenGraph: createEmptyProjectGraph(),
    archive: createEmptyProjectArchive(),
  }
}

function normalizeProjectFigmaFile(rawFile: RawProjectFigmaFile, index: number): ProjectFigmaFile | null {
  const url = normalizeTrimmedString(rawFile?.url)
  const title = normalizeTrimmedString(rawFile?.title) || normalizeTrimmedString(rawFile?.name)
  const rawId = normalizeTrimmedString(rawFile?.id)
  const fileKey = normalizeNullableTrimmedString(rawFile?.fileKey)

  if (!url && !title && !rawId && !fileKey) {
    return null
  }

  const id = rawId || fileKey || `figma-file-${index + 1}`

  return {
    id,
    fileKey,
    nodeId: normalizeNullableTrimmedString(rawFile?.nodeId),
    notes: normalizeNullableTrimmedString(rawFile?.notes),
    status: normalizeNullableTrimmedString(rawFile?.status),
    title: title || id,
    updatedAt: normalizeOptionalProjectTimestamp(rawFile?.updatedAt),
    url,
  }
}

function normalizeProjectGraphNode(rawNode: RawProjectGraphNode, index: number): ProjectGraphNode | null {
  const rawId = normalizeTrimmedString(rawNode?.id)
  const rawTitle = normalizeTrimmedString(rawNode?.title)
  const rawKind = normalizeTrimmedString(rawNode?.kind)
  const rawSourceId = normalizeTrimmedString(rawNode?.sourceId)

  if (!rawId && !rawTitle && !rawKind && !rawSourceId) {
    return null
  }

  const id = rawId || `node-${index + 1}`

  return {
    id,
    kind: rawKind || "item",
    sourceId: rawSourceId || null,
    title: rawTitle || id,
  }
}

function normalizeProjectGraphEdge(rawEdge: RawProjectGraphEdge): ProjectGraphEdge | null {
  const from = normalizeTrimmedString(rawEdge?.from)
  const to = normalizeTrimmedString(rawEdge?.to)

  if (!from || !to) {
    return null
  }

  return {
    from,
    to,
    kind: normalizeTrimmedString(rawEdge?.kind) || "relates-to",
    label: normalizeTrimmedString(rawEdge?.label),
  }
}

function normalizeProjectGraph(rawGraph: RawProjectGraph): ProjectGraph {
  return {
    nodes: Array.isArray(rawGraph?.nodes)
      ? rawGraph.nodes
        .map((node, index) => normalizeProjectGraphNode(node, index))
        .filter((node): node is ProjectGraphNode => node !== null)
      : [],
    edges: Array.isArray(rawGraph?.edges)
      ? rawGraph.edges
        .map((edge) => normalizeProjectGraphEdge(edge))
        .filter((edge): edge is ProjectGraphEdge => edge !== null)
      : [],
    updatedAt: normalizeOptionalProjectTimestamp(rawGraph?.updatedAt),
  }
}

function normalizeProjectArchiveEntry(rawEntry: RawProjectArchiveEntry, index: number): ProjectArchiveEntry | null {
  const path = normalizeTrimmedString(rawEntry?.path)
  const rawId = normalizeTrimmedString(rawEntry?.id)
  const rawTitle = normalizeTrimmedString(rawEntry?.title)
  const rawKind = normalizeTrimmedString(rawEntry?.kind)
  const rawGroupId = normalizeTrimmedString(rawEntry?.groupId)
  const rawSource = normalizeTrimmedString(rawEntry?.source)

  if (!path && !rawId && !rawTitle && !rawKind && !rawGroupId && !rawSource) {
    return null
  }

  const id = rawId || `archive-entry-${index + 1}`

  return {
    groupId: rawGroupId || "analytics",
    id,
    kind: rawKind || "document",
    path,
    source: rawSource || null,
    title: rawTitle || id,
    updatedAt: normalizeOptionalProjectTimestamp(rawEntry?.updatedAt),
  }
}

function normalizeProjectArchive(rawArchive: RawProjectArchive): ProjectArchive {
  return {
    entries: Array.isArray(rawArchive?.entries)
      ? rawArchive.entries
        .map((entry, index) => normalizeProjectArchiveEntry(entry, index))
        .filter((entry): entry is ProjectArchiveEntry => entry !== null)
      : [],
    updatedAt: normalizeOptionalProjectTimestamp(rawArchive?.updatedAt),
  }
}

function normalizeProjectMetadata(
  rawMetadata: RawProjectMetadata,
  fallback?: Partial<Pick<ProjectMetadata, "code" | "title" | "uiKitId">>,
): ProjectMetadata {
  const emptyMetadata = createEmptyProjectMetadata()

  if (!rawMetadata || typeof rawMetadata !== "object") {
    return {
      ...emptyMetadata,
      code: normalizeTrimmedString(fallback?.code),
      title: normalizeTrimmedString(fallback?.title),
      uiKitId: (normalizeTrimmedString(fallback?.uiKitId) || emptyMetadata.uiKitId) as ProjectUiKitId,
    }
  }

  return {
    title: normalizeTrimmedString(rawMetadata.title) || normalizeTrimmedString(fallback?.title),
    code: normalizeTrimmedString(rawMetadata.code) || normalizeTrimmedString(fallback?.code),
    uiKitId: (normalizeTrimmedString(rawMetadata.uiKitId) || normalizeTrimmedString(fallback?.uiKitId) || emptyMetadata.uiKitId) as ProjectUiKitId,
    figmaFiles: Array.isArray(rawMetadata.figmaFiles)
      ? rawMetadata.figmaFiles
        .map((file, index) => normalizeProjectFigmaFile(file, index))
        .filter((file): file is ProjectFigmaFile => file !== null)
      : [],
    componentGraph: normalizeProjectGraph(rawMetadata.componentGraph),
    screenGraph: normalizeProjectGraph(rawMetadata.screenGraph),
    archive: normalizeProjectArchive(rawMetadata.archive),
  }
}

export {
  createEmptyProjectMetadata,
  normalizeProjectArchive,
  normalizeProjectGraph,
  normalizeProjectMetadata,
}

export type {
  ProjectArchive,
  ProjectArchiveEntry,
  ProjectFigmaFile,
  ProjectGraph,
  ProjectGraphEdge,
  ProjectGraphNode,
  ProjectMetadata,
  RawProjectArchive,
  RawProjectArchiveEntry,
  RawProjectFigmaFile,
  RawProjectGraph,
  RawProjectGraphEdge,
  RawProjectGraphNode,
  RawProjectMetadata,
}
