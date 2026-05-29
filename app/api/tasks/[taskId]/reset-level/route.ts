import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { resetCurrentTaskLevelRuntime } from "@/lib/task/actions"

type Params = { taskId: string }

export async function POST(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const result = await resetCurrentTaskLevelRuntime(taskId)

  if (result.kind === "not_found") {
    return Response.json({ ok: false, error: result.error }, { status: 404 })
  }

  if (result.kind === "snapshot_missing") {
    return Response.json({ ok: false, error: result.error }, { status: 409 })
  }

  return Response.json({
    ok: true,
    taskItem: result.taskItem,
    taskData: result.taskData,
    started: result.started,
  })
}
