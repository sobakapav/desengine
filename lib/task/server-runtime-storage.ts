import "server-only"

import { readdir, readFile, writeFile } from "node:fs/promises"
import path from "node:path"

import { LevelsCatalogSchema } from "@/lib/level/schema"
import { TaskConfigSchema } from "@/lib/task/schema"
import { appConfig } from "@/lib/system/config/server"
import {
  defaultUserProgressStore,
  ensureParentDir,
  ensureUserProgressStorage,
  getTaskCatalogFilePath,
  getTaskCheckResultPath,
} from "@/lib/user/server"
import { UserProgressStoreSchema } from "@/lib/user/schema"
import type { UserProgressStore } from "@/lib/user/types"

import { taskServerProgress } from "./server-runtime-progress"
import { renderTaskHint } from "./hints"
import type { LevelConfig } from "../level/types"
import type { Project } from "../project/runtime"
import type { TaskCheckResult, TaskConfig, TaskProgress } from "./types"

const FORCED_TASK_MAX_LEVEL = 3

async function readLevelsCatalogRaw() {
  const levelsRoot = appConfig.levelsCatalogRoot
  const entries = await readdir(levelsRoot, { withFileTypes: true })
  const levelDirs = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

  const levels = await Promise.all(
    levelDirs.map(async (levelId) => {
      const [configRaw, overviewRaw] = await Promise.all([
        readFile(path.join(levelsRoot, levelId, "config.json"), "utf-8"),
        readFile(path.join(levelsRoot, levelId, "overview.md"), "utf-8").catch(() => ""),
      ])

      return {
        ...JSON.parse(configRaw),
        description: overviewRaw.trim(),
      }
    }),
  )

  return LevelsCatalogSchema.parse({ levels })
}

async function readTaskCheckResult(taskId: string): Promise<TaskCheckResult | null> {
  try {
    const raw = await readFile(getTaskCheckResultPath(taskId), "utf-8")
    const parsed = JSON.parse(raw) as TaskCheckResult

    if (
      !parsed
      || typeof parsed !== "object"
      || typeof parsed.taskId !== "string"
      || typeof parsed.levelId !== "string"
      || typeof parsed.levelNumber !== "number"
      || typeof parsed.levelTitle !== "string"
      || typeof parsed.attemptNumber !== "number"
      || typeof parsed.maxCheckAttempts !== "number"
      || typeof parsed.passed !== "boolean"
      || typeof parsed.message !== "string"
      || typeof parsed.kind !== "string"
      || typeof parsed.createdAt !== "string"
    ) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

async function repairProgressFromCheckResult(taskId: string, taskProgress: TaskProgress) {
  const checkResult = await readTaskCheckResult(taskId)
  if (!checkResult || !checkResult.passed || checkResult.kind !== "passed") return false

  const levelProgress = taskProgress.levels[String(checkResult.levelNumber)]
  if (!levelProgress) return false

  let changed = false
  if (levelProgress.status !== "completed") {
    levelProgress.status = "completed"
    changed = true
  }

  if (!levelProgress.isPassed) {
    levelProgress.isPassed = true
    changed = true
  }

  if (!levelProgress.completedAt) {
    levelProgress.completedAt = checkResult.createdAt
    changed = true
  }

  const attemptNumber = Math.max(0, checkResult.attemptNumber || 0)
  if ((levelProgress.checkAttemptsUsed ?? 0) < attemptNumber) {
    levelProgress.checkAttemptsUsed = attemptNumber
    changed = true
  }

  const maxLevel = Math.max(1, ...Object.keys(taskProgress.levels).map(Number).filter(Number.isFinite))
  const expectedCurrentLevel = Math.min(checkResult.levelNumber + 1, maxLevel)
  if (taskProgress.currentLevel < expectedCurrentLevel) {
    taskProgress.currentLevel = expectedCurrentLevel
    changed = true
  }

  return changed
}

async function readUserProgressStore() {
  try {
    const raw = await readFile(appConfig.userProgressFile, "utf-8")
    const store = UserProgressStoreSchema.parse(JSON.parse(raw))
    let changed = false

    for (const [taskId, taskProgress] of Object.entries(store.tasks)) {
      const normalizedFlags = taskServerProgress.normalizePassedFlags(taskProgress)
      const repairedFromCheckResult = await repairProgressFromCheckResult(taskId, taskProgress)
      changed = changed || normalizedFlags || repairedFromCheckResult
    }

    if (changed) await writeUserProgressStore(store)
    return store
  } catch {
    return defaultUserProgressStore()
  }
}

async function writeUserProgressStore(store: UserProgressStore) {
  await ensureUserProgressStorage()
  await writeFile(appConfig.userProgressFile, JSON.stringify(store, null, 2), "utf-8")
}

async function writeTaskCheckResult(result: TaskCheckResult) {
  const filePath = getTaskCheckResultPath(result.taskId)
  await ensureParentDir(filePath)
  await writeFile(filePath, JSON.stringify(result, null, 2), "utf-8")
}

async function readTaskConfig(taskId: string): Promise<TaskConfig> {
  const configPath = getTaskCatalogFilePath(taskId, appConfig.taskConfigFile)
  const rawTaskConfig = await readFile(configPath, "utf-8")
  const parsed = TaskConfigSchema.parse(JSON.parse(rawTaskConfig))
  return { ...parsed, maxLevel: FORCED_TASK_MAX_LEVEL }
}

async function readTaskCatalog() {
  const entries = await readdir(appConfig.taskCatalogRoot, { withFileTypes: true })
  const taskDirs = entries.filter((entry) => entry.isDirectory())
  const tasks = await Promise.all(
    taskDirs.map(async (entry) => ({
      id: entry.name,
      config: await readTaskConfig(entry.name),
    })),
  )

  return tasks.sort((a, b) => a.id.localeCompare(b.id))
}

async function readTaskLevelTip(
  taskId: string,
  level: LevelConfig,
  taskConfig: TaskConfig,
  project?: Project,
) {
  return renderTaskHint({
    taskCatalogRoot: appConfig.taskCatalogRoot,
    taskId,
    level,
    taskConfig,
    project,
  })
}

export const taskServerStorage = {
  forcedTaskMaxLevel: FORCED_TASK_MAX_LEVEL,
  readLevelsCatalogRaw,
  readUserProgressStore,
  writeUserProgressStore,
  readTaskCheckResult,
  writeTaskCheckResult,
  readTaskConfig,
  readTaskCatalog,
  readTaskLevelTip,
}
