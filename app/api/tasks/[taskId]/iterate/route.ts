import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { iterateTaskLevel } from "@/lib/task/actions"

type Params = { taskId: string }

type Body = {
  prompt?: string
}

export async function POST(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const body = (await request.json().catch(() => null)) as Body | null
  const promptText = String(body?.prompt || "").trim()

  if (!promptText) {
    return Response.json({ ok: false, error: "Введите уточняющий промпт" }, { status: 400 })
  }

  const result = await iterateTaskLevel(taskId, promptText)
  return Response.json(result.body, { status: result.status ?? 200 })
}
