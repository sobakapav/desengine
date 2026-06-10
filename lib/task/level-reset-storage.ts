import "server-only"

import { readFile, rm, writeFile } from "node:fs/promises"

import { getLevelEditableWorkbenchFiles } from "@/lib/lab/workbench"
import type { Project } from "@/lib/project/runtime"
import {
  getScopedTaskRuntimeFilePath,
  resolveTaskProject,
  resolveTaskRuntimeFilePath,
} from "@/lib/task/project-runtime-scope"
import {
  ensureParentDir,
} from "@/lib/user/server"

type TaskLevelSnapshot = {
  levelNumber: number
  editableFileIds: string[]
  contentByFileId: Record<string, string>
}

function getTaskLevelSnapshotPath(taskId: string, projectId: string, levelNumber: number) {
  return getScopedTaskRuntimeFilePath(taskId, projectId, `.level-reset/level-${levelNumber}.json`)
}

async function writeTaskLevelSnapshot(
  taskId: string,
  project: Project,
  levelNumber: number,
  editableFileIds: string[],
  contentByFileId: Record<string, string>,
) {
  const filePath = getTaskLevelSnapshotPath(taskId, project.id, levelNumber)
  const snapshot: TaskLevelSnapshot = {
    levelNumber,
    editableFileIds,
    contentByFileId,
  }

  await ensureParentDir(filePath)
  await writeFile(filePath, JSON.stringify(snapshot, null, 2), "utf-8")
}

async function saveCurrentTaskLevelSnapshot(
  taskId: string,
  project: Project | undefined,
  levelNumber: number,
  editableFileIds: string[],
  contentByFileId: Record<string, string>,
) {
  const resolvedProject = await resolveTaskProject(taskId, project)
  const snapshotContent = Object.fromEntries(
    getLevelEditableWorkbenchFiles(editableFileIds)
      .map((file) => [file.id, contentByFileId[file.id]])
      .filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  )

  await writeTaskLevelSnapshot(taskId, resolvedProject, levelNumber, editableFileIds, snapshotContent)
}

async function readTaskLevelSnapshot(
  taskId: string,
  levelNumber: number,
  project?: Project,
): Promise<TaskLevelSnapshot | null> {
  const resolvedProject = await resolveTaskProject(taskId, project)
  const filePath = await resolveTaskRuntimeFilePath(
    taskId,
    resolvedProject.id,
    `.level-reset/level-${levelNumber}.json`,
  )

  try {
    const raw = await readFile(filePath, "utf-8")
    const parsed = JSON.parse(raw) as Partial<TaskLevelSnapshot> | null

    if (!parsed || parsed.levelNumber !== levelNumber || !Array.isArray(parsed.editableFileIds)) {
      return null
    }

    if (!parsed.contentByFileId || typeof parsed.contentByFileId !== "object") {
      return null
    }

    const contentByFileId = Object.fromEntries(
      Object.entries(parsed.contentByFileId).filter((entry): entry is [string, string] => (
        typeof entry[0] === "string" && typeof entry[1] === "string"
      )),
    )

    return {
      levelNumber,
      editableFileIds: parsed.editableFileIds.filter((item): item is string => typeof item === "string"),
      contentByFileId,
    }
  } catch {
    return null
  }
}

async function restoreTaskLevelSnapshot(
  taskId: string,
  snapshot: TaskLevelSnapshot,
  editableFileIds: string[],
  project?: Project,
) {
  const resolvedProject = await resolveTaskProject(taskId, project)
  const files = getLevelEditableWorkbenchFiles(editableFileIds)

  for (const file of files) {
    const filePath = getScopedTaskRuntimeFilePath(taskId, resolvedProject.id, file.fileName)
    const content = snapshot.contentByFileId[file.id]

    if (typeof content === "string") {
      await ensureParentDir(filePath)
      await writeFile(filePath, content, "utf-8")
      continue
    }

    await rm(filePath, { force: true })
  }
}

export {
  readTaskLevelSnapshot,
  restoreTaskLevelSnapshot,
  saveCurrentTaskLevelSnapshot,
}
