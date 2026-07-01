import { notFound, redirect } from "next/navigation"

import { Lab } from "@/components/desengine/lab/LabScreen"
import { createLabTaskScreenEventInput } from "@/components/desengine/lab/LabScreen/screen-event"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { normalizeProject } from "@/lib/project/runtime"
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
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { taskId, screen } = await params
  const resolvedSearchParams = await searchParams
  const hasProjectContext = ["projectId", "projectTitle", "uiKitId"]
    .some((key) => {
      const value = resolvedSearchParams[key]
      return typeof value === "string" ? value.trim().length > 0 : Array.isArray(value) && value[0]?.trim().length > 0
    })
  const project = hasProjectContext
    ? normalizeProject({
      id: typeof resolvedSearchParams.projectId === "string" ? resolvedSearchParams.projectId : `task-${taskId}`,
      title: typeof resolvedSearchParams.projectTitle === "string" ? resolvedSearchParams.projectTitle : `Проект ${taskId}`,
      settings: {
        uiKitId: typeof resolvedSearchParams.uiKitId === "string" ? resolvedSearchParams.uiKitId : undefined,
      },
    })
    : undefined
  const canonicalPath = createLabUrl(taskId, screen, project)

  await requireAccessOrRedirect(canonicalPath)

  const taskItem = await getTaskListItemById(taskId, project)

  if (!taskItem) {
    notFound()
  }

  const labContext = await getTaskLabContext(taskItem)
  const allowedScreens = labContext?.editableFileIds ?? []

  if (allowedScreens.length === 0) {
    notFound()
  }

  if (!isAccessibleTaskScreen(screen, allowedScreens)) {
    redirect(createLabUrl(taskId, null, project))
  }

  const { taskData } = await buildCurrentTaskScreenData({ taskId, taskItem, labContext, project })
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
