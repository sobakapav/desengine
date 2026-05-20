import { readFile } from "node:fs/promises"

import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { getTaskCatalogFilePath } from "@/lib/user/server"

type Params = { taskId: string }

function normalizeImageId(raw: string | null) {
  const value = raw?.trim()
  if (!value) return "base"

  const lower = value.toLowerCase()
  if (lower === "none" || lower === "off" || lower === "false" || lower === "0") {
    return "base"
  }

  // Защита от случайных/враждебных значений в query param.
  if (!/^[a-z0-9_-]+$/i.test(value)) {
    return "base"
  }

  return value
}

/**
 * @example
 * ```ts
 * await GET(new Request("http://localhost/api/tasks/task-1/image?imageId=base"), {
 *   params: Promise.resolve({ taskId: "task-1" }),
 * })
 * ```
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const { searchParams } = new URL(request.url)
  const imageId = normalizeImageId(searchParams.get("imageId"))

  const requestedImagePath = getTaskCatalogFilePath(taskId, `${imageId}.png`)

  try {
    const buf = await readFile(requestedImagePath)
    return new Response(buf, {
      headers: {
        "content-type": "image/png",
        "cache-control": "no-store",
      },
    })
  } catch {
    return Response.json({ ok: false, error: "Картинка не найдена" }, { status: 404 })
  }
}
