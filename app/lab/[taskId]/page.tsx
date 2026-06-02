import { notFound, redirect } from "next/navigation"

import { Lab } from "@/components/desengine/lab/LabScreen"
import { createLabTaskScreenEventInput } from "@/components/desengine/lab/LabScreen/screen-event"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getLabUrl } from "@/lib/lab/navigation"
import { getLevelOverview, getTaskLabContext, getTaskListItemById } from "@/lib/system/server"
import { getDefaultCodeScreen, isAccessibleCodeScreen } from "@/lib/lab/editor"
import { buildCurrentTaskScreenData } from "@/lib/task/task-screen-data"

type Params = {
  taskId: string
}

/**
 * @example
 * ```tsx
 * <LabTaskPage params={Promise.resolve({ taskId: "task-1" })} />
 * ```
 */
export default async function LabTaskPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { taskId } = await params
  const canonicalPath = getLabUrl(taskId)

  await requireAccessOrRedirect(canonicalPath)

  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    notFound()
  }

  const labContext = await getTaskLabContext(taskItem)
  const allowedScreens = labContext?.editableFileIds ?? []
  const defaultScreen = getDefaultCodeScreen()

  if (allowedScreens.length === 0) {
    notFound()
  }

  if (!isAccessibleCodeScreen(defaultScreen, allowedScreens)) {
    redirect(getLabUrl(taskId, allowedScreens[0]))
  }

  const { taskData } = await buildCurrentTaskScreenData({ taskId, taskItem, labContext })
  const levelOverview = await getLevelOverview(taskItem.progress.currentLevelId)

  return (
    <Lab
      initLevelOverview={levelOverview}
      initScreen={{ type: "task", screen: defaultScreen }}
      initTaskItem={taskItem}
      initTaskData={taskData}
      initTaskScreenEventInput={createLabTaskScreenEventInput(taskId, defaultScreen)}
    />
  )
}
