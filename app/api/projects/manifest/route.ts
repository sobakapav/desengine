import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import {
  createProjectManifestReadResponse,
  createProjectManifestWriteResponse,
} from "@/lib/project/api"

function createBadRequest(message: string) {
  return Response.json({
    ok: false,
    error: message,
  }, {
    status: 400,
  })
}

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/projects/manifest", {
 *   method: "POST",
 *   body: JSON.stringify({ project: { id: "project-a", title: "Альфа" } }),
 * }))
 * ```
 */
export async function POST(request: Request) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const body = await request.json()
    return Response.json(createProjectManifestReadResponse(body))
  } catch (error) {
    return createBadRequest(
      error instanceof Error ? error.message : "Не удалось подготовить manifest проекта.",
    )
  }
}

/**
 * @example
 * ```ts
 * await PUT(new Request("http://localhost/api/projects/manifest", {
 *   method: "PUT",
 *   body: JSON.stringify({ manifest: { project: { id: "project-a", title: "Альфа" } } }),
 * }))
 * ```
 */
export async function PUT(request: Request) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const body = await request.json()
    return Response.json(createProjectManifestWriteResponse(body?.manifest))
  } catch (error) {
    return createBadRequest(
      error instanceof Error ? error.message : "Не удалось импортировать manifest проекта.",
    )
  }
}
