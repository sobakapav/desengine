import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { saveTaskFiles } from "@/lib/task/actions"

type Params = { taskId: string }

type Body = {
  updates: Array<{
    fileId: string
    content: string
  }>
}

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/tasks/task-1/files", {
 *   method: "POST",
 *   body: JSON.stringify({ updates: [{ fileId: "component", content: "export default function Component() { return null }" }] }),
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
  const updates = Array.isArray(body?.updates) ? body.updates : []
  const result = await saveTaskFiles(taskId, updates)

  if (result.kind === "not_found") {
    return Response.json({ ok: false, error: result.error }, { status: 404 })
  }

  if (result.kind === "write_failed") {
    return Response.json(
      { ok: false, written: result.written, errors: result.errors },
      { status: 500 },
    )
  }

  return Response.json({ ok: true, written: result.written })
}
