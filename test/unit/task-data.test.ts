// @openSpec capability: level-labs
// @openSpec scenarios:
// @openSpec  - "Задача ещё не стартовала"

import { describe, expect, it } from "vitest"

import { createEmptyTaskData } from "../../lib/task/data"
import type { TaskLabContext } from "../../lib/task/types"

const labContext: TaskLabContext = {
  levelId: "level-1",
  levelNumber: 1,
  labId: "intro-lab",
  commonExplanation: "Общее объяснение",
  taskTip: "Подсказка",
  editableFileIds: ["component"],
  images: [
    {
      id: "reference",
      src: "/api/tasks/task-1/images/reference.png",
      width: 640,
      height: 480,
      show: true,
    },
  ],
}

describe("createEmptyTaskData", () => {
  it("строит стабильный shape для ещё не начатой задачи", () => {
    const taskData = createEmptyTaskData("task-1", labContext)

    expect(taskData).toEqual({
      taskId: "task-1",
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
    })
  })

  it("не разделяет mutable пустые коллекции между вызовами", () => {
    const first = createEmptyTaskData("task-1", labContext)
    const second = createEmptyTaskData("task-1", labContext)

    expect(first.contentByFileId).not.toBe(second.contentByFileId)
    expect(first.promptHistory).not.toBe(second.promptHistory)
    expect(first.llmUsageSummary.providersUsed).not.toBe(second.llmUsageSummary.providersUsed)
  })
})
