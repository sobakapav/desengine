import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { resetTaskRuntime } from "@/lib/task/actions"

type Params = { taskId: string }

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/tasks/task-1/reset"), {
 *   params: Promise.resolve({ taskId: "task-1" }),
 * })
 * ```
 */
export async function POST(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const result = await resetTaskRuntime(taskId)

  if (result.kind === "not_found") {
    return Response.json({ ok: false, error: result.error }, { status: 404 })
  }

  return Response.json({
    ok: true,
    taskItem: result.taskItem,
    taskData: result.taskData,
    started: result.started,
  })
}
