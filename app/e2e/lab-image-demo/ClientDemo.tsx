"use client"

import { InPicture } from "@/components/desengine/lab/InOut/InPicture"
import { createEmptyTaskData } from "@/lib/task/data"
import type { TaskLabContext } from "@/lib/task/types"

import { DEMO_PNG_URL } from "../image-inspector/ClientDemo"

function ClientDemo() {
  const labContext: TaskLabContext = {
    levelId: "level-1",
    levelNumber: 1,
    labId: "level-1",
    commonExplanation: "",
    taskTip: "",
    taskCheckContract: "",
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
  }
  const taskData = createEmptyTaskData("e2e-demo-task", labContext)

  return (
    <div className="max-w-3xl">
      <InPicture task="e2e-demo-task" taskData={taskData} />
    </div>
  )
}

export { ClientDemo }
