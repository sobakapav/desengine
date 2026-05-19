"use client"

import { InPicture } from "@/components/desengine/lab/InOut/InPicture"
import type { TaskData } from "@/lib/task/types"

import { DEMO_PNG_URL } from "../image-inspector/ClientDemo"

function ClientDemo() {
  const taskData: TaskData = {
    taskId: "e2e-demo-task",
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
    labContext: {
      levelId: "level-1",
      levelNumber: 1,
      labId: "level-1",
      commonExplanation: "",
      taskTip: "",
      editableFileIds: ["App.tsx"],
      images: [
        {
          id: "base",
          src: DEMO_PNG_URL,
          width: 1,
          height: 1,
          show: true,
        },
      ],
    },
  }

  return (
    <div className="max-w-3xl">
      <InPicture task="e2e-demo-task" taskData={taskData} />
    </div>
  )
}

export { ClientDemo }
