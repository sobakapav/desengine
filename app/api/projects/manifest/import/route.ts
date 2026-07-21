import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { createServerProjectStorage } from "@/lib/project/storage-disk"
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

  try {
    const storage = createServerProjectStorage()
    const manifest = await storage.importProjectManifest(body)
    return Response.json({ ok: true, manifest })
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Не удалось импортировать manifest проекта на диск.",
      },
      { status: 400 },
    )
  }
}
