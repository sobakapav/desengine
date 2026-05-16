import { notFound, redirect } from "next/navigation"

import { Lab } from "@/components/desengine/lab/LabScreen"
import { requireAccessOrRedirect } from "@/lib/auth/server"
import { getLabUrl } from "@/lib/lab/navigation"
import { getLevelOverview, getTaskLabContext, getTaskListItemById, isTaskStarted, readTaskData } from "@/lib/system/server"
import { getDefaultCodeScreen, isAccessibleCodeScreen } from "@/lib/lab/editor"

type Params = {
  taskId: string
}

function createEmptyTaskData(taskId: string, labContext: Awaited<ReturnType<typeof getTaskLabContext>>) {
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

  const started = await isTaskStarted(taskId)
  const taskData = started
    ? await readTaskData(taskItem, labContext)
    : createEmptyTaskData(taskId, labContext)
  const levelOverview = await getLevelOverview(taskItem.progress.currentLevelId)

  return (
    <Lab
      initLevelOverview={levelOverview}
      initScreen={{ type: "task", screen: defaultScreen }}
      initTaskItem={taskItem}
      initTaskData={taskData}
    />
  )
}
