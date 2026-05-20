import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { startTaskLevel } from "@/lib/task/actions"

type Params = { taskId: string }

export async function POST(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const result = await startTaskLevel(taskId)
  return Response.json(result.body, { status: result.status ?? 200 })
}
