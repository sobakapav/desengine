import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { checkTaskLevel } from "@/lib/task/actions"

type Params = { taskId: string }

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/tasks/task-1/check"), {
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
  const result = await checkTaskLevel(taskId)
  return Response.json(result.body, { status: result.status ?? 200 })
}
