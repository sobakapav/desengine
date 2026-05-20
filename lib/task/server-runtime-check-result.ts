import "server-only"

import { removeTaskCheckResult } from "@/lib/user/server"

import { taskServerStorage } from "./server-runtime-storage"
import type { TaskCheckResult } from "./types"

export const taskServerCheckResult = {
  async getTaskCheckResult(taskId: string) {
    return taskServerStorage.readTaskCheckResult(taskId)
  },
  async saveTaskCheckResult(result: TaskCheckResult) {
    await taskServerStorage.writeTaskCheckResult(result)
  },
  async clearTaskCheckResult(taskId: string) {
    await removeTaskCheckResult(taskId)
  },
}
