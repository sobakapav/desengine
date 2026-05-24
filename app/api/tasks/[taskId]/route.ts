import {
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
} from "@/lib/system/server"
import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { buildCurrentTaskScreenData } from "@/lib/task/task-screen-data"

type Params = { taskId: string }

/**
 * @example
 * ```ts
 * await GET(new Request("http://localhost/api/tasks/task-1"), {
 *   params: Promise.resolve({ taskId: "task-1" }),
 * })
 * ```
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params

  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    return Response.json({ ok: false, error: "Задание не найдено" }, { status: 404 })
  }

  const labContext = await getTaskLabContext(taskItem)
  const { started, taskData } = await buildCurrentTaskScreenData({ taskId, taskItem, labContext })
  const level = await getLevelForTaskItem(taskItem)

  return Response.json({
    ok: true,
    taskItem,
    started,
    taskData,
    level,
  })
}
