import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { getLevelOverview } from "@/lib/system/server"

type Params = { levelId: string }

/**
 * @example
 * ```ts
 * await GET(new Request("http://localhost/api/levels/level-1"), {
 *   params: Promise.resolve({ levelId: "level-1" }),
 * })
 * ```
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { levelId } = await params
  const overview = await getLevelOverview(levelId)
  return Response.json({ ok: true, overview })
}
