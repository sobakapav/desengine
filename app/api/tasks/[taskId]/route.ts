import {
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
} from "@/lib/system/server"
import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { normalizeProject } from "@/lib/project/runtime"
import { buildCurrentTaskScreenData } from "@/lib/task/task-screen-data"

type Params = { taskId: string }

function parseProjectFromRequest(request: Request, taskId: string) {
  const { searchParams } = new URL(request.url)
  const hasProjectContext = ["projectId", "projectTitle", "uiKitId", "uiMode"]
    .some((key) => searchParams.get(key)?.trim())

  if (!hasProjectContext) {
    return undefined
  }

  return normalizeProject({
    id: searchParams.get("projectId") ?? `task-${taskId}`,
    title: searchParams.get("projectTitle") ?? `Проект ${taskId}`,
    settings: {
      uiKitId: searchParams.get("uiKitId"),
      uiMode: searchParams.get("uiMode"),
    },
  })
}

/**
 * @example
 * ```ts
 * await GET(new Request("http://localhost/api/tasks/task-1"), {
 *   params: Promise.resolve({ taskId: "task-1" }),
 * })
 * ```
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const project = parseProjectFromRequest(request, taskId)

  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    return Response.json({ ok: false, error: "Задание не найдено" }, { status: 404 })
  }

  const labContext = await getTaskLabContext(taskItem)
  const { started, taskData } = await buildCurrentTaskScreenData({ taskId, taskItem, labContext, project })
  const level = await getLevelForTaskItem(taskItem)

  return Response.json({
    ok: true,
    taskItem,
    started,
    taskData,
    level,
  })
}
