import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { normalizeProject } from "@/lib/project/runtime"
import { startTaskLevel } from "@/lib/task/actions"

type Params = { taskId: string }

type Body = {
  project?: unknown
  activeScreen?: unknown
}

async function parseRequestPayload(request: Request, taskId: string) {
  try {
    const payload = await request.json() as Body | null
    return {
      project: !payload || typeof payload.project !== "object" || payload.project === null
        ? undefined
        : normalizeProject({
          ...payload.project,
          id: "id" in payload.project && typeof payload.project.id === "string"
            ? payload.project.id
            : `task-${taskId}`,
          title: "title" in payload.project && typeof payload.project.title === "string"
            ? payload.project.title
            : `Проект ${taskId}`,
        }),
      activeScreen: typeof payload?.activeScreen === "string" && payload.activeScreen.trim()
        ? payload.activeScreen.trim()
        : undefined,
    }
  } catch {
    return { project: undefined, activeScreen: undefined }
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
  const { project, activeScreen } = await parseRequestPayload(request, taskId)
  const result = await startTaskLevel(taskId, project, activeScreen)
  return Response.json(result.body, { status: result.status ?? 200 })
}
