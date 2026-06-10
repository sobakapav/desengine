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
  async getTaskCheckResult(taskId: string) {
    return taskServerStorage.readTaskCheckResult(taskId)
  },
  async saveTaskCheckResult(result: TaskCheckResult) {
    await taskServerStorage.writeTaskCheckResult(result)
  },
  async clearTaskCheckResult(taskId: string) {
    const project = await resolveTaskProject(taskId)

    if (isLegacyTaskRuntimeProject(taskId, project.id)) {
      await removeTaskCheckResult(taskId)
      return
    }

    await rm(getScopedTaskRuntimeFilePath(taskId, project.id, "check-result.json"), { force: true })
  },
}
