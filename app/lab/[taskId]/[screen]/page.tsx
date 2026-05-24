import { notFound, redirect } from "next/navigation"

import { Lab } from "@/components/desengine/lab/LabScreen"
import { createLabTaskScreenEventInput } from "@/components/desengine/lab/LabScreen/screen-event"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { createLabUrl, isAccessibleTaskScreen } from "@/lib/system/navigation"
import { getLevelOverview, getTaskLabContext, getTaskListItemById } from "@/lib/system/server"
import { buildCurrentTaskScreenData } from "@/lib/task/task-screen-data"

type Params = {
  taskId: string
  screen: string
}

/**
 * @example
 * ```tsx
 * <TaskScreenPage params={Promise.resolve({ taskId: "task-1", screen: "component" })} />
 * ```
 */
export default async function TaskScreenPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { taskId, screen } = await params
  const canonicalPath = createLabUrl(taskId, screen)

  await requireAccessOrRedirect(canonicalPath)

  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    notFound()
  }

  const labContext = await getTaskLabContext(taskItem)
  const allowedScreens = labContext?.editableFileIds ?? []

  if (allowedScreens.length === 0) {
    notFound()
  }

  if (!isAccessibleTaskScreen(screen, allowedScreens)) {
    redirect(createLabUrl(taskId))
  }

  const { taskData } = await buildCurrentTaskScreenData({ taskId, taskItem, labContext })
  const levelOverview = await getLevelOverview(taskItem.progress.currentLevelId)

  return (
    <Lab
      initLevelOverview={levelOverview}
      initScreen={{ type: "task", screen }}
      initTaskItem={taskItem}
      initTaskData={taskData}
      initTaskScreenEventInput={createLabTaskScreenEventInput(taskId, screen)}
    />
  )
}
