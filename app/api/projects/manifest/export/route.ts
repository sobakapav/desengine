import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { createProjectManifestReadResponse } from "@/lib/project/api"
import { importProjectManifest, type RawProjectManifest } from "@/lib/project/manifest"

type Body = RawProjectManifest

/**
 * @example
 * ```ts
 * await POST(new Request("http://localhost/api/projects/manifest/export", {
 *   method: "POST",
 *   body: JSON.stringify({ project: { id: "project-a", title: "Alpha" } }),
 * }))
 * ```
 */
export async function POST(request: Request) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const body = (await request.json().catch(() => null)) as Body
  const imported = body ? body : null

  if (!imported?.project) {
    return Response.json(
      { ok: false, error: "Нужен project manifest payload для экспорта." },
      { status: 400 },
    )
  }

  const normalized = importProjectManifest(imported)
  return Response.json(createProjectManifestReadResponse({
    components: normalized.components,
    project: normalized.project,
  }))
}
