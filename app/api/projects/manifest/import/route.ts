import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { createProjectManifestWriteResponse } from "@/lib/project/api"
import type { RawProjectManifest } from "@/lib/project/manifest"

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/projects/manifest/import", {
 *   method: "POST",
 *   body: JSON.stringify({ project: { id: "project-a", title: "Alpha" } }),
 * }))
 * ```
 */
export async function POST(request: Request) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const body = (await request.json().catch(() => null)) as RawProjectManifest

  if (!body?.project) {
    return Response.json(
      { ok: false, error: "Нужен project manifest payload для импорта." },
      { status: 400 },
    )
  }

  return Response.json(createProjectManifestWriteResponse(body))
}
