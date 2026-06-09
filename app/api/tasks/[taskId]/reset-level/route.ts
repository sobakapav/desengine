import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { resetCurrentTaskLevelRuntime } from "@/lib/task/actions"
import {
  createTaskMutationOverloadHttpResult,
  isTaskMutationOverloadError,
} from "@/lib/task/mutation-boundary"

type Params = { taskId: string }

export async function POST(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  let result: Awaited<ReturnType<typeof resetCurrentTaskLevelRuntime>>

  try {
    result = await resetCurrentTaskLevelRuntime(taskId)
  } catch (error) {
    if (!isTaskMutationOverloadError(error)) {
      throw error
    }

    const overloadResult = createTaskMutationOverloadHttpResult(error)
    return Response.json(overloadResult.body, { status: overloadResult.status ?? 503 })
  }

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
