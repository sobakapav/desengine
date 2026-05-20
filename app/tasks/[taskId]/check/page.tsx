import { notFound, redirect } from "next/navigation"

import { Lab } from "@/components/desengine/lab/LabScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { createLabUrl, createTaskCheckPath } from "@/lib/system/navigation"
import { getLevelOverview, getTaskCheckResult, getTaskDoneTransition, getTaskLabContext, getTaskListItemById, getTaskPendingTransition, isTaskStarted, readTaskData } from "@/lib/system/server"
import { createEmptyTaskData } from "@/lib/task/data"

type Params = {
  taskId: string
}

/**
 * @example
 * ```tsx
 * <TaskCheckPage params={Promise.resolve({ taskId: "task-1" })} />
 * ```
 */
export default async function TaskCheckPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { taskId } = await params
  const canonicalPath = createTaskCheckPath(taskId)

  await requireAccessOrRedirect(canonicalPath)

  const [taskItem, checkResult] = await Promise.all([
    getTaskListItemById(taskId),
    getTaskCheckResult(taskId),
  ])

  if (!taskItem) {
    notFound()
  }

  if (!checkResult) {
    redirect(createLabUrl(taskId))
  }

  const transition = checkResult.kind === "passed"
    ? (taskItem.progress.isCompleted
      ? await getTaskDoneTransition(taskId)
      : await getTaskPendingTransition(taskId))
    : null

  const labContext = await getTaskLabContext(taskItem)
  const started = await isTaskStarted(taskId)
  const taskData = started
    ? await readTaskData(taskItem, labContext)
    : createEmptyTaskData(taskId, labContext)
  const levelOverview = await getLevelOverview(taskItem.progress.currentLevelId)

  return (
    <Lab
      initLevelOverview={levelOverview}
      initScreen={{ type: "check", result: checkResult, transition }}
      initTaskItem={taskItem}
      initTaskData={taskData}
    />
  )
}
