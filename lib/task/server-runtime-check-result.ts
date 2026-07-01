import "server-only"

import { rm } from "node:fs/promises"

import { taskServerStorage } from "./server-runtime-storage"
import type { TaskCheckResult } from "./types"
import {
  getScopedTaskRuntimeFilePath,
  isLegacyTaskRuntimeProject,
  resolveTaskProject,
} from "@/lib/task/project-runtime-scope"
import { removeTaskCheckResult } from "@/lib/user/server"

export const taskServerCheckResult = {
  async getTaskCheckResult(taskId: string, project?: Parameters<typeof resolveTaskProject>[1]) {
    return taskServerStorage.readTaskCheckResult(taskId, project)
  },
  async saveTaskCheckResult(result: TaskCheckResult, project?: Parameters<typeof resolveTaskProject>[1]) {
    await taskServerStorage.writeTaskCheckResult(result, project)
  },
  async clearTaskCheckResult(taskId: string, project?: Parameters<typeof resolveTaskProject>[1]) {
    const resolvedProject = await resolveTaskProject(taskId, project)

    if (isLegacyTaskRuntimeProject(taskId, resolvedProject.id)) {
      await removeTaskCheckResult(taskId)
      return
    }

    await rm(getScopedTaskRuntimeFilePath(taskId, resolvedProject.id, "check-result.json"), { force: true })
  },
}
