import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import {
  normalizeProject,
  normalizeProjectMigrationTarget,
  type Project,
  type ProjectMigrationTarget,
} from "@/lib/project/runtime"
import { migrateProjectUiKitRuntime } from "@/lib/task/actions"
import {
  createTaskMutationOverloadHttpResult,
  isTaskMutationOverloadError,
} from "@/lib/task/mutation-boundary"

type Params = { taskId: string }

async function parseProjectMigrationRequest(request: Request) {
  try {
    const payload = await request.json() as {
      project?: unknown
      target?: unknown
    } | null

    const rawProject = typeof payload?.project === "object" && payload.project !== null
      ? payload.project
      : null
    const rawTarget = typeof payload?.target === "object" && payload.target !== null
      ? payload.target
      : null

    if (!rawProject || !rawTarget) {
      return null
    }

    return {
      project: normalizeProject(rawProject as Project),
      target: normalizeProjectMigrationTarget(rawTarget as ProjectMigrationTarget),
    }
  } catch {
    return null
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const migrationRequest = await parseProjectMigrationRequest(request)
  if (!migrationRequest) {
    return Response.json({ ok: false, error: "Не удалось прочитать project migration request" }, { status: 400 })
  }

  let result: Awaited<ReturnType<typeof migrateProjectUiKitRuntime>>

  try {
    result = await migrateProjectUiKitRuntime(taskId, migrationRequest.project, migrationRequest.target)
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

  if (result.kind === "invalid_request") {
    return Response.json({ ok: false, error: result.error }, { status: 400 })
  }

  return Response.json({
    ok: true,
    taskItem: result.taskItem,
    taskData: result.taskData,
    started: result.started,
    invalidationScope: result.invalidationScope,
  })
}
