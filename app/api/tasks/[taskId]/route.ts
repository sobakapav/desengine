import {
  getLevelForTaskItem,
  getTaskLabContext,
  getTaskListItemById,
  isTaskStarted,
  readTaskData,
} from "@/lib/system/server"
import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { createEmptyTaskData } from "@/lib/task/data"

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

  const started = await isTaskStarted(taskId)
  const labContext = await getTaskLabContext(taskItem)
  const taskData = started
    ? await readTaskData(taskItem, labContext)
    : createEmptyTaskData(taskId, labContext)
  const level = await getLevelForTaskItem(taskItem)

  return Response.json({
    ok: true,
    taskItem,
    started,
    taskData,
    level,
  })
}
