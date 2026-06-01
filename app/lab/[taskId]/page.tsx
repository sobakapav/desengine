import { notFound, redirect } from "next/navigation"

import { TaskRoute } from "@/components/desengine/lab/TaskRoute"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getLabUrl } from "@/lib/lab/navigation"
import { getTaskLabContext, getTaskListItemById } from "@/lib/system/server"
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
  return (
    <TaskRoute
      initTaskItem={taskItem}
      initTaskData={taskData}
    />
  )
}
