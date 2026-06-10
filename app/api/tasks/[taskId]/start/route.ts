import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { normalizeProject } from "@/lib/project/runtime"
import { startTaskLevel } from "@/lib/task/actions"

type Params = { taskId: string }

type Body = {
  project?: unknown
}

async function parseProjectFromRequest(request: Request, taskId: string) {
  try {
    const payload = await request.json() as Body | null
    if (!payload || typeof payload.project !== "object" || payload.project === null) {
      return undefined
    }

    return normalizeProject({
      ...payload.project,
      id: "id" in payload.project && typeof payload.project.id === "string"
        ? payload.project.id
        : `task-${taskId}`,
      title: "title" in payload.project && typeof payload.project.title === "string"
        ? payload.project.title
        : `Проект ${taskId}`,
    })
  } catch {
    return undefined
  }
}

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/tasks/task-1/start"), {
 *   params: Promise.resolve({ taskId: "task-1" }),
 * })
 * ```
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const project = await parseProjectFromRequest(request, taskId)
  const result = await startTaskLevel(taskId, project)
  return Response.json(result.body, { status: result.status ?? 200 })
}
