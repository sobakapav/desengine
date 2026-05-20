import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { readTaskImageBuffer } from "@/lib/task/image-source"
import { getTaskCatalogDir } from "@/lib/user/server"

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

function buildTaskIdCandidates(taskId: string) {
  const normalized = taskId.trim()
  if (!normalized) return []

  const withoutPrefix = normalized.startsWith("task-")
    ? normalized.slice("task-".length)
    : normalized
  const withPrefix = normalized.startsWith("task-")
    ? normalized
    : `task-${normalized}`

  return Array.from(new Set([normalized, withoutPrefix, withPrefix]))
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
  const taskCandidates = buildTaskIdCandidates(taskId)

  for (const taskCandidate of taskCandidates) {
    try {
      const asset = await readTaskImageBuffer(taskCandidate, imageId)
      if (asset) {
        return new Response(asset.buffer, {
          headers: {
            "content-type": asset.contentType,
            "cache-control": "no-store",
          },
        })
      }
    } catch {
      // continue
    }
  }

  return Response.json(
    {
      ok: false,
      error: "Картинка не найдена",
      debug: {
        taskId,
        imageId,
        taskCandidates,
        taskCatalogDir: getTaskCatalogDir(taskId),
      },
    },
    { status: 404 },
  )
}
