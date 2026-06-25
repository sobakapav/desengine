import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { normalizeProject } from "@/lib/project/runtime"
import { iterateTaskLevel } from "@/lib/task/actions"

type Params = { taskId: string }

type Body = {
  prompt?: string
  project?: unknown
  activeScreen?: unknown
}

function parseProjectPayload(project: unknown, taskId: string) {
  if (typeof project !== "object" || project === null) {
    return undefined
  }

  return normalizeProject({
    ...project,
    id: "id" in project && typeof project.id === "string"
      ? project.id
      : `task-${taskId}`,
    title: "title" in project && typeof project.title === "string"
      ? project.title
      : `Проект ${taskId}`,
  })
}

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/tasks/task-1/iterate", {
 *   method: "POST",
 *   body: JSON.stringify({ prompt: "Сделай кнопку заметнее" }),
 * }), { params: Promise.resolve({ taskId: "task-1" }) })
 * ```
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const body = (await request.json().catch(() => null)) as Body | null
  const promptText = String(body?.prompt || "").trim()
  const project = parseProjectPayload(body?.project, taskId)
  const activeScreen = typeof body?.activeScreen === "string" && body.activeScreen.trim()
    ? body.activeScreen.trim()
    : undefined

  if (!promptText) {
    return Response.json({ ok: false, error: "Введите уточняющий промпт" }, { status: 400 })
  }

  const result = await iterateTaskLevel(taskId, promptText, project, activeScreen)
  return Response.json(result.body, { status: result.status ?? 200 })
}
