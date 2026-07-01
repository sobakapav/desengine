import "server-only"

import { readFile, writeFile } from "node:fs/promises"

import { normalizeProject, type Project } from "@/lib/project/runtime"
import { parseProjectComponentRuntimeId } from "@/lib/task/project-runtime-scope-id"
import {
  ensureParentDir,
  getUserTaskFilePath,
  pathExists,
} from "@/lib/user/server"

const TASK_PROJECT_SCOPE_FILE_NAME = ".project-runtime.json"
const TASK_PROJECTS_DIR_NAME = ".projects"

function createDefaultTaskProject(taskId: string): Project {
  return normalizeProject({
    id: `task-${taskId}`,
    title: `Проект ${taskId}`,
  })
}

function encodeTaskProjectScopeSegment(projectId: string) {
  return encodeURIComponent(projectId.trim())
}

function getTaskProjectScopeFilePath(taskId: string) {
  return getUserTaskFilePath(taskId, TASK_PROJECT_SCOPE_FILE_NAME)
}

function getScopedTaskRuntimeRelativePath(projectId: string, fileName: string) {
  return `${TASK_PROJECTS_DIR_NAME}/${encodeTaskProjectScopeSegment(projectId)}/${fileName}`
}

function getScopedTaskRuntimeFilePath(taskId: string, projectId: string, fileName: string) {
  return getUserTaskFilePath(taskId, getScopedTaskRuntimeRelativePath(projectId, fileName))
}

function isLegacyTaskRuntimeProject(taskId: string, projectId: string) {
  return projectId === createDefaultTaskProject(taskId).id
}

async function readStoredTaskProject(taskId: string): Promise<Project | null> {
  try {
    const raw = await readFile(getTaskProjectScopeFilePath(taskId), "utf-8")
    const parsed = JSON.parse(raw) as {
      lastProject?: unknown
      scopes?: unknown
    } | Project

    if (parsed && typeof parsed === "object" && "lastProject" in parsed) {
      return parsed.lastProject ? normalizeProject(parsed.lastProject as Project) : null
    }

    return normalizeProject(parsed as Project)
  } catch {
    return null
  }
}

async function listStoredTaskProjects(taskId: string): Promise<Project[]> {
  try {
    const raw = await readFile(getTaskProjectScopeFilePath(taskId), "utf-8")
    const parsed = JSON.parse(raw) as {
      lastProject?: unknown
      scopes?: unknown
    } | Project

    if (!parsed || typeof parsed !== "object") {
      return []
    }

    if ("scopes" in parsed && Array.isArray(parsed.scopes)) {
      return parsed.scopes.map((scope) => normalizeProject(scope as Project))
    }

    return [normalizeProject(parsed as Project)]
  } catch {
    return []
  }
}

async function writeStoredTaskProject(taskId: string, project: Project) {
  const filePath = getTaskProjectScopeFilePath(taskId)
  const normalizedProject = normalizeProject(project)
  const storedProjects = await listStoredTaskProjects(taskId)
  const nextProjects = [
    normalizedProject,
    ...storedProjects.filter((entry) => entry.id !== normalizedProject.id),
  ]

  await ensureParentDir(filePath)
  await writeFile(filePath, JSON.stringify({
    lastProject: normalizedProject,
    scopes: nextProjects,
  }, null, 2), "utf-8")
}

async function resolveTaskProject(taskId: string, project?: Project): Promise<Project> {
  if (project) {
    const normalized = normalizeProject(project)
    await writeStoredTaskProject(taskId, normalized)
    return normalized
  }

  const storedProject = await readStoredTaskProject(taskId)
  if (storedProject) {
    return storedProject
  }

  const fallbackProject = createDefaultTaskProject(taskId)
  await writeStoredTaskProject(taskId, fallbackProject)
  return fallbackProject
}

async function resolveTaskRuntimeFilePath(taskId: string, projectId: string, fileName: string) {
  const scopedPath = getScopedTaskRuntimeFilePath(taskId, projectId, fileName)

  if (await pathExists(scopedPath)) {
    return scopedPath
  }

  if (isLegacyTaskRuntimeProject(taskId, projectId)) {
    return getUserTaskFilePath(taskId, fileName)
  }

  return scopedPath
}

function buildTaskMutationScopeKey(taskId: string, projectId: string) {
  return `${taskId}::${projectId}`
}

function buildTaskProgressScopeKey(taskId: string, projectId?: string | null) {
  if (!projectId?.trim() || isLegacyTaskRuntimeProject(taskId, projectId)) {
    return taskId
  }

  return buildTaskMutationScopeKey(taskId, projectId)
}

function parseTaskProgressScopeKey(scopeKey: string) {
  const separatorIndex = scopeKey.indexOf("::")

  if (separatorIndex < 0) {
    return {
      taskId: scopeKey,
      projectId: null,
    }
  }

  return {
    taskId: scopeKey.slice(0, separatorIndex),
    projectId: scopeKey.slice(separatorIndex + 2) || null,
  }
}

function getBaseProjectId(projectId: string) {
  return parseProjectComponentRuntimeId(projectId).projectId
}

function getProjectComponentId(projectId: string) {
  return parseProjectComponentRuntimeId(projectId).componentId
}

export {
  buildTaskProgressScopeKey,
  buildTaskMutationScopeKey,
  createDefaultTaskProject,
  getBaseProjectId,
  getProjectComponentId,
  getScopedTaskRuntimeFilePath,
  getScopedTaskRuntimeRelativePath,
  isLegacyTaskRuntimeProject,
  listStoredTaskProjects,
  parseTaskProgressScopeKey,
  readStoredTaskProject,
  resolveTaskProject,
  resolveTaskRuntimeFilePath,
  writeStoredTaskProject,
}
