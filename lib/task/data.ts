import type { TaskData, TaskLabContext } from "@/lib/task/types"

export function createEmptyTaskData(
  taskId: string,
  labContext: TaskLabContext | null,
): TaskData {
  return {
    taskId,
    contentByFileId: {},
    promptHistory: [],
    llmUsageSummary: {
      totalCalls: 0,
      teachingCostCents: 0,
      providersUsed: [],
      inputTokens: null,
      outputTokens: null,
      totalTokens: null,
      callsWithoutProviderMetrics: 0,
    },
    labContext,
  }
}
