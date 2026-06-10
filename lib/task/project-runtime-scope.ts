import "server-only"

import { readFile, writeFile } from "node:fs/promises"

import { normalizeProject, type Project } from "@/lib/project/runtime"
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
    return normalizeProject(JSON.parse(raw))
  } catch {
    return null
  }
}

async function writeStoredTaskProject(taskId: string, project: Project) {
  const filePath = getTaskProjectScopeFilePath(taskId)
  await ensureParentDir(filePath)
  await writeFile(filePath, JSON.stringify(normalizeProject(project), null, 2), "utf-8")
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

export {
  buildTaskMutationScopeKey,
  createDefaultTaskProject,
  getScopedTaskRuntimeFilePath,
  getScopedTaskRuntimeRelativePath,
  isLegacyTaskRuntimeProject,
  readStoredTaskProject,
  resolveTaskProject,
  resolveTaskRuntimeFilePath,
  writeStoredTaskProject,
}
