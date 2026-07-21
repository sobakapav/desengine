"use client"

import type { RawProjectManifest } from "@/lib/project/manifest"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import type { ProjectWorkspaceSnapshot } from "@/lib/project/workspace-snapshot"

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

type StoredProject = {
  project: ProjectWorkspace
  rootPath: string
  surface: ProjectSurfaceSummary | null
}

type ProjectRegistryResponse = {
  ok: true
  projects: StoredProject[]
  activeProjectId: string | null
}

type ProjectOverviewResponse = {
  ok: true
  project: ProjectWorkspace | null
  rootPath: string | null
  activeProjectId: string | null
  surface: ProjectSurfaceSummary | null
}

type ProjectWorkspaceResponse = {
  ok: true
  snapshot: ProjectWorkspaceSnapshot | null
}

type CreateProjectRequest = {
  mode: "create"
  code?: string | null
  id?: string | null
  title: string
  rootPath: string
  uiKitId?: ProjectWorkspace["settings"]["uiKitId"] | null
}

type ConnectProjectRequest = {
  mode: "connect"
  rootPath: string
}

type ProjectWorkspaceActionRequest =
  | { type: "start-project-work" }
  | { type: "create-component"; title: string }
  | { type: "start-component-work"; componentId: string }
  | { type: "complete-component"; componentId: string }
  | { type: "reopen-component"; componentId: string }

async function readJsonResponse<T>(response: Response): Promise<T> {
  const body = await response.json().catch(() => null) as { error?: string } & T | null

  if (!response.ok) {
    throw new Error(body?.error || "Не удалось выполнить project request.")
  }

  return body as T
}

async function fetchProjectRegistry() {
  const response = await fetch("/api/projects", {
    method: "GET",
    cache: "no-store",
  })

  return readJsonResponse<ProjectRegistryResponse>(response)
}

async function createProjectOnServer(request: CreateProjectRequest) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  })

  return readJsonResponse<{ ok: true; project: ProjectWorkspace; rootPath: string; surface: ProjectSurfaceSummary | null }>(response)
}

async function connectProjectOnServer(request: ConnectProjectRequest) {
  const response = await fetch("/api/projects", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(request),
  })

  return readJsonResponse<{ ok: true; project: ProjectWorkspace; rootPath: string; surface: ProjectSurfaceSummary | null }>(response)
}

async function fetchProjectOverview(projectId: string) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}`, {
    method: "GET",
    cache: "no-store",
  })

  return readJsonResponse<ProjectOverviewResponse>(response)
}

async function saveProjectOnServer(args: {
  metadata?: {
    code?: string | null
  }
  project: ProjectWorkspace
  previousProjectId?: string | null
}) {
  const response = await fetch(`/api/projects/${encodeURIComponent(args.project.id)}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(args),
  })

  return readJsonResponse<{ ok: true; project: ProjectWorkspace; rootPath: string | null; surface: ProjectSurfaceSummary | null }>(response)
}

async function fetchProjectWorkspace(projectId: string) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/workspace`, {
    method: "GET",
    cache: "no-store",
  })

  return readJsonResponse<ProjectWorkspaceResponse>(response)
}

async function runProjectWorkspaceActionOnServer(projectId: string, action: ProjectWorkspaceActionRequest) {
  const response = await fetch(`/api/projects/${encodeURIComponent(projectId)}/workspace`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(action),
  })

  return readJsonResponse<ProjectWorkspaceResponse>(response)
}

async function importProjectManifestOnServer(manifest: RawProjectManifest) {
  const response = await fetch("/api/projects/manifest/import", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(manifest),
  })

  return readJsonResponse<{ ok: true; manifest: { project: ProjectWorkspace } }>(response)
}

export {
  connectProjectOnServer,
  createProjectOnServer,
  fetchProjectOverview,
  fetchProjectRegistry,
  fetchProjectWorkspace,
  importProjectManifestOnServer,
  runProjectWorkspaceActionOnServer,
  saveProjectOnServer,
}

export type {
  ProjectSurfaceArchiveFile,
  ProjectSurfaceArchiveGroup,
  ProjectSurfaceFigmaFile,
  ProjectSurfaceGraph,
  ProjectRegistryResponse,
  ProjectSurfaceMetadata,
  ProjectSurfaceSummary,
  ProjectWorkspaceActionRequest,
  ProjectWorkspaceResponse,
  StoredProject,
}
