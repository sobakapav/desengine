import "server-only"

import { readFile, rm, writeFile } from "node:fs/promises"

import { getLevelEditableWorkbenchFiles } from "@/lib/lab/workbench"
import {
  ensureParentDir,
  ensureUserTaskDir,
  getUserTaskFilePath,
} from "@/lib/user/server"

type TaskLevelSnapshot = {
  levelNumber: number
  editableFileIds: string[]
  contentByFileId: Record<string, string>
}

function getTaskLevelSnapshotPath(taskId: string, levelNumber: number) {
  return getUserTaskFilePath(taskId, `.level-reset/level-${levelNumber}.json`)
}

async function writeTaskLevelSnapshot(
  taskId: string,
  levelNumber: number,
  editableFileIds: string[],
  contentByFileId: Record<string, string>,
) {
  const filePath = getTaskLevelSnapshotPath(taskId, levelNumber)
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
  levelNumber: number,
  editableFileIds: string[],
  contentByFileId: Record<string, string>,
) {
  const snapshotContent = Object.fromEntries(
    getLevelEditableWorkbenchFiles(editableFileIds)
      .map((file) => [file.id, contentByFileId[file.id]])
      .filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  )

  await writeTaskLevelSnapshot(taskId, levelNumber, editableFileIds, snapshotContent)
}

async function readTaskLevelSnapshot(taskId: string, levelNumber: number): Promise<TaskLevelSnapshot | null> {
  const filePath = getTaskLevelSnapshotPath(taskId, levelNumber)

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
) {
  const files = getLevelEditableWorkbenchFiles(editableFileIds)

  await ensureUserTaskDir(taskId)

  for (const file of files) {
    const filePath = getUserTaskFilePath(taskId, file.fileName)
    const content = snapshot.contentByFileId[file.id]

    if (typeof content === "string") {
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
