import "server-only"

import { writeFile } from "node:fs/promises"

import {
  projectNeedsUiKitMigration,
  type Project,
  type ProjectMigrationTarget,
} from "@/lib/project/runtime"
import { createEmptyTaskData } from "@/lib/task/data"
import { runTaskMutation } from "@/lib/task/mutation-boundary"
import {
  clearTaskCheckResult,
  getTaskLabContext,
  getTaskListItemById,
  invalidateCurrentTaskLevelForProjectMigration,
  resetCurrentTaskLevel,
  resetTask,
} from "@/lib/task/server"
import {
  ensureParentDir,
} from "@/lib/user/server"
import {
  buildTaskMutationScopeKey,
  getScopedTaskRuntimeFilePath,
  resolveTaskProject,
} from "@/lib/task/project-runtime-scope"

import { getLevelEditableWorkbenchFileMap } from "../../lab/workbench"
import type {
  ProjectUiKitMigrationRuntimeResult,
  ResetCurrentTaskLevelRuntimeResult,
  ResetTaskRuntimeResult,
  SaveTaskFilesResult,
  TaskFileUpdate,
} from "./types"
import { taskActionShared } from "./shared"

export const taskFilesAction = {
  async saveTaskFiles(
    taskId: string,
    updates: TaskFileUpdate[],
    project?: Project,
  ): Promise<SaveTaskFilesResult> {
    const resolvedProject = await resolveTaskProject(taskId, project)

    return runTaskMutation(buildTaskMutationScopeKey(taskId, resolvedProject.id), async () => {
      const taskItem = await getTaskListItemById(taskId, resolvedProject)

      if (!taskItem) {
        return { kind: "not_found", error: "Задание не найдено" }
      }

      const labContext = await getTaskLabContext(taskItem)
      const editable = getLevelEditableWorkbenchFileMap(labContext.editableFileIds)
      const errors: Array<{ fileId: string; error: string }> = []
      let written = 0

      for (const update of updates) {
        if (!update || typeof update.fileId !== "string") continue

        const fileName = editable.get(update.fileId)
        if (!fileName) continue
        if (fileName.toLowerCase().endsWith(".png")) continue

        const filePath = getScopedTaskRuntimeFilePath(taskId, resolvedProject.id, fileName)

        try {
          await ensureParentDir(filePath)
          await writeFile(filePath, update.content ?? "", "utf-8")
          written += 1
        } catch (error) {
          errors.push({
            fileId: update.fileId,
            error: error instanceof Error ? error.message : "Ошибка записи файла",
          })
        }
      }

      if (errors.length) {
        return { kind: "write_failed", written, errors }
      }

      return { kind: "saved", written }
    })
  },
  async resetTaskRuntime(taskId: string, project?: Project): Promise<ResetTaskRuntimeResult> {
    const resolvedProject = await resolveTaskProject(taskId, project)

    return runTaskMutation(buildTaskMutationScopeKey(taskId, resolvedProject.id), async () => {
      const taskItem = await getTaskListItemById(taskId, resolvedProject)

      if (!taskItem) {
        return { kind: "not_found", error: "Задание не найдено" }
      }

      await resetTask(taskId, { project: resolvedProject })
      await clearTaskCheckResult(taskId, resolvedProject)

      const nextTaskItem = await getTaskListItemById(taskId, resolvedProject)
      const labContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null

      return {
        kind: "reset",
        taskItem: nextTaskItem,
        taskData: nextTaskItem ? createEmptyTaskData(taskId, labContext) : null,
        started: false,
      }
    })
  },
  async resetCurrentTaskLevelRuntime(taskId: string, project?: Project): Promise<ResetCurrentTaskLevelRuntimeResult> {
    const resolvedProject = await resolveTaskProject(taskId, project)

    return runTaskMutation(buildTaskMutationScopeKey(taskId, resolvedProject.id), async () => {
      const taskItem = await getTaskListItemById(taskId, resolvedProject)

      if (!taskItem) {
        return { kind: "not_found", error: "Задание не найдено" }
      }

      try {
        const progress = await resetCurrentTaskLevel(taskId, resolvedProject)
        const nextTaskItem = await getTaskListItemById(taskId, resolvedProject)
        const labContext = nextTaskItem ? await getTaskLabContext(nextTaskItem) : null

        return {
          kind: "level_reset",
          taskItem: nextTaskItem ? { ...nextTaskItem, progress } : nextTaskItem,
          taskData: nextTaskItem ? createEmptyTaskData(taskId, labContext) : null,
          started: Boolean(nextTaskItem?.started),
        }
      } catch (error) {
        return {
          kind: "snapshot_missing",
          error: error instanceof Error ? error.message : "Не удалось сбросить текущий уровень",
        }
      }
    })
  },
  async migrateProjectUiKitRuntime(
    taskId: string,
    project: Project,
    target: ProjectMigrationTarget,
  ): Promise<ProjectUiKitMigrationRuntimeResult> {
    const resolvedProject = await resolveTaskProject(taskId, project)

    return runTaskMutation(buildTaskMutationScopeKey(taskId, resolvedProject.id), async () => {
      const taskItem = await getTaskListItemById(taskId, resolvedProject)

      if (!taskItem) {
        return { kind: "not_found", error: "Задание не найдено" }
      }

      const matchesPendingTarget = (
        resolvedProject.migration.targetUiKitId === target.uiKitId
      )
      if (!matchesPendingTarget) {
        return {
          kind: "invalid_request",
          error: "Project migration request не совпадает с подтверждённым target UI kit.",
        }
      }

      if (!projectNeedsUiKitMigration(resolvedProject, target)) {
        return {
          kind: "invalid_request",
          error: "Project migration request не меняет текущий project contract.",
        }
      }

      try {
        const progress = await invalidateCurrentTaskLevelForProjectMigration(taskId, resolvedProject)
        const nextTaskItem = await getTaskListItemById(taskId, resolvedProject)
        if (!nextTaskItem) {
          return { kind: "not_found", error: "Задание не найдено" }
        }

        const currentTaskItem = { ...nextTaskItem, progress }
        const { taskData } = await taskActionShared.buildTaskResponse(taskId, currentTaskItem, resolvedProject)

        return {
          kind: "project_migration",
          taskItem: currentTaskItem,
          taskData,
          started: true,
          invalidationScope: "current-level",
        }
      } catch (error) {
        return {
          kind: "snapshot_missing",
          error: error instanceof Error ? error.message : "Не удалось подготовить уровень к migration проекта",
        }
      }
    })
  },
}
