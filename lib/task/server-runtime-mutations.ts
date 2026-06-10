import "server-only"

import type { Project } from "@/lib/project/runtime"
import { readPromptHistory, writePromptHistory } from "@/lib/onboarding/repository"
import {
  removeTaskCheckResult,
  removeUserTaskDir,
} from "@/lib/user/server"
import {
  getScopedTaskRuntimeFilePath,
  isLegacyTaskRuntimeProject,
} from "@/lib/task/project-runtime-scope"
import { rm } from "node:fs/promises"

import {
  readTaskLevelSnapshot,
  restoreTaskLevelSnapshot,
} from "./level-reset-storage"
import { summarizeTaskProgress } from "./progress"
import { taskServerModel } from "./server-runtime-model"
import { taskServerOverview } from "./server-runtime-overview"
import { taskServerProgress } from "./server-runtime-progress"
import { taskServerStorage } from "./server-runtime-storage"
import { taskServerTransitions } from "./server-runtime-transitions"
import type {
  FailedTaskCheckMutationResult,
  TaskCheckMutationResult,
  TaskProgressMutationResult,
} from "./server-runtime-types"

async function loadMutationContext(taskId: string) {
  const [levels, store, taskConfig, promptHistory] = await Promise.all([
    taskServerOverview.getLevelsCatalog(),
    taskServerStorage.readUserProgressStore(),
    taskServerStorage.readTaskConfig(taskId),
    readPromptHistory(taskId),
  ])

  const taskProgress = taskServerProgress.ensureTaskProgress(store, taskId, taskConfig.maxLevel)
  const changed = taskServerProgress.reconcileTaskProgressWithHistory(
    levels,
    taskConfig,
    taskProgress,
    promptHistory,
  )
  return { levels, store, taskConfig, taskProgress, changed }
}

function buildResetLevelProgress() {
  return {
    status: "available" as const,
    isPassed: false,
    promptsUsed: 0,
    checkAttemptsUsed: 0,
    checkingState: "idle" as const,
  }
}

async function clearTaskCheckResultForResetScope(taskId: string, currentLevelNumber?: number) {
  if (typeof currentLevelNumber !== "number") {
    await removeTaskCheckResult(taskId)
    return
  }

  const checkResult = await taskServerStorage.readTaskCheckResult(taskId)
  if (!checkResult || checkResult.levelNumber !== currentLevelNumber) return

  await removeTaskCheckResult(taskId)
}

function buildMigrationLevelProgress() {
  return {
    ...buildResetLevelProgress(),
    status: "in_progress" as const,
    initializedAt: new Date().toISOString(),
  }
}

export const taskServerMutations = {
  async markTaskLevelInProgress(taskId: string) {
    const context = await loadMutationContext(taskId)
    const currentLevel = context.taskProgress.levels[String(context.taskProgress.currentLevel)]
    let changed = context.changed

    if (currentLevel.status === "available") {
      currentLevel.status = "in_progress"
      context.taskProgress.updatedAt = new Date().toISOString()
      changed = true
    }

    if (changed) await taskServerStorage.writeUserProgressStore(context.store)
    return summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress)
  },
  async markCurrentTaskLevelInitialized(taskId: string) {
    const context = await loadMutationContext(taskId)
    const levelProgress = context.taskProgress.levels[String(context.taskProgress.currentLevel)]
    let changed = false

    if (!levelProgress.initializedAt) {
      levelProgress.initializedAt = new Date().toISOString()
      changed = true
    }

    if (levelProgress.status === "available") {
      levelProgress.status = "in_progress"
      changed = true
    }

    if (changed) {
      context.taskProgress.updatedAt = new Date().toISOString()
      await taskServerStorage.writeUserProgressStore(context.store)
    }

    return summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress)
  },
  async registerPromptForCurrentLevel(taskId: string): Promise<TaskProgressMutationResult> {
    const context = await loadMutationContext(taskId)
    const currentLevelNumber = context.taskProgress.currentLevel
    taskServerModel.requireLevel(context.levels, currentLevelNumber)
    const levelProgress = context.taskProgress.levels[String(currentLevelNumber)]

    if (!levelProgress.initializedAt || levelProgress.status === "completed") {
      return {
        summary: summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress),
        transition: null,
      }
    }

    levelProgress.status = "in_progress"
    levelProgress.checkingState = "idle"
    context.taskProgress.updatedAt = new Date().toISOString()

    await taskServerStorage.writeUserProgressStore(context.store)

    return {
      summary: summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress),
      transition: null,
    }
  },
  async markCurrentTaskLevelCheckTechnicalError(taskId: string) {
    const context = await loadMutationContext(taskId)
    const levelProgress = context.taskProgress.levels[String(context.taskProgress.currentLevel)]

    levelProgress.checkingState = "awaiting_retry"
    context.taskProgress.updatedAt = new Date().toISOString()

    await taskServerStorage.writeUserProgressStore(context.store)
    return summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress)
  },
  async passCurrentTaskLevelCheck(taskId: string): Promise<TaskCheckMutationResult> {
    const context = await loadMutationContext(taskId)
    const currentLevelNumber = context.taskProgress.currentLevel
    const currentLevel = taskServerModel.requireLevel(context.levels, currentLevelNumber)
    const levelProgress = context.taskProgress.levels[String(currentLevelNumber)]

    levelProgress.checkAttemptsUsed = (levelProgress.checkAttemptsUsed ?? 0) + 1
    levelProgress.checkingState = "idle"
    levelProgress.status = "completed"
    levelProgress.isPassed = true
    levelProgress.completedAt = new Date().toISOString()
    context.taskProgress.updatedAt = new Date().toISOString()

    const toLevelNumber = currentLevelNumber < context.taskConfig.maxLevel ? currentLevelNumber + 1 : null
    context.taskProgress.currentLevel = toLevelNumber ?? currentLevelNumber
    const transition = await taskServerTransitions.buildTransition(
      context.levels,
      taskId,
      context.taskConfig,
      currentLevelNumber,
      toLevelNumber,
    )

    await taskServerStorage.writeUserProgressStore(context.store)

    return {
      summary: summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress),
      transition,
      attemptNumber: levelProgress.checkAttemptsUsed,
      maxCheckAttempts: currentLevel.maxCheckAttempts,
    }
  },
  async failCurrentTaskLevelCheck(taskId: string): Promise<FailedTaskCheckMutationResult> {
    const context = await loadMutationContext(taskId)
    const currentLevelNumber = context.taskProgress.currentLevel
    const currentLevel = taskServerModel.requireLevel(context.levels, currentLevelNumber)
    const levelProgress = context.taskProgress.levels[String(currentLevelNumber)]

    levelProgress.checkAttemptsUsed = (levelProgress.checkAttemptsUsed ?? 0) + 1
    levelProgress.checkingState = "idle"
    context.taskProgress.updatedAt = new Date().toISOString()

    const attemptNumber = levelProgress.checkAttemptsUsed
    const exhausted = attemptNumber >= currentLevel.maxCheckAttempts

    await taskServerStorage.writeUserProgressStore(context.store)
    if (exhausted) {
      await taskServerMutations.resetTask(taskId, { preserveCheckResult: true })
      return {
        summary: null,
        attemptNumber,
        maxCheckAttempts: currentLevel.maxCheckAttempts,
        reset: true,
      }
    }

    return {
      summary: summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress),
      attemptNumber,
      maxCheckAttempts: currentLevel.maxCheckAttempts,
      reset: false,
    }
  },
  async resetTask(taskId: string, options?: { preserveCheckResult?: boolean; project?: Project }) {
    const store = await taskServerStorage.readUserProgressStore()
    const projectId = options?.project?.id

    if (!projectId || isLegacyTaskRuntimeProject(taskId, projectId)) {
      await removeUserTaskDir(taskId)
    } else {
      const projectRuntimeDir = getScopedTaskRuntimeFilePath(taskId, projectId, ".")
      await rm(projectRuntimeDir, { recursive: true, force: true })
    }

    if (store.tasks[taskId]) {
      delete store.tasks[taskId]
      await taskServerStorage.writeUserProgressStore(store)
    }

    if (!options?.preserveCheckResult) {
      await clearTaskCheckResultForResetScope(taskId)
    }
  },
  async resetCurrentTaskLevel(taskId: string, project?: Project) {
    const context = await loadMutationContext(taskId)
    const currentLevelNumber = context.taskProgress.currentLevel
    const currentLevel = taskServerModel.requireLevel(context.levels, currentLevelNumber)
    const snapshot = await readTaskLevelSnapshot(taskId, currentLevelNumber, project)

    if (!snapshot) {
      throw new Error("Для этого уровня ещё нет сохранённой стартовой точки. Откройте уровень заново после следующего перехода.")
    }

    const promptHistory = (await readPromptHistory(taskId, project))
      .filter((entry) => (entry.levelNumber ?? 1) !== currentLevelNumber)
    await restoreTaskLevelSnapshot(taskId, snapshot, currentLevel.editableFileIds, project)

    context.taskProgress.levels[String(currentLevelNumber)] = buildResetLevelProgress()
    context.taskProgress.updatedAt = new Date().toISOString()

    await taskServerStorage.writeUserProgressStore(context.store)
    await clearTaskCheckResultForResetScope(taskId, currentLevelNumber)
    await writePromptHistory(taskId, promptHistory, project)

    return summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress)
  },
  async invalidateCurrentTaskLevelForProjectMigration(taskId: string, project?: Project) {
    const context = await loadMutationContext(taskId)
    const currentLevelNumber = context.taskProgress.currentLevel
    const currentLevel = taskServerModel.requireLevel(context.levels, currentLevelNumber)
    const snapshot = await readTaskLevelSnapshot(taskId, currentLevelNumber, project)

    if (!snapshot) {
      throw new Error("Для текущего уровня не найден baseline-снимок. Повторно откройте уровень перед сменой UI kit.")
    }

    const promptHistory = (await readPromptHistory(taskId, project))
      .filter((entry) => (entry.levelNumber ?? 1) !== currentLevelNumber)
    await restoreTaskLevelSnapshot(taskId, snapshot, currentLevel.editableFileIds, project)

    context.taskProgress.levels[String(currentLevelNumber)] = buildMigrationLevelProgress()
    context.taskProgress.updatedAt = new Date().toISOString()

    await taskServerStorage.writeUserProgressStore(context.store)
    await clearTaskCheckResultForResetScope(taskId, currentLevelNumber)
    await writePromptHistory(taskId, promptHistory, project)

    return summarizeTaskProgress(context.levels, context.taskConfig, context.taskProgress)
  },
}
