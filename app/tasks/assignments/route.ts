import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { filterTaskProjectBindingsForProject } from "@/lib/task/assignment"
import { listTaskProjectBindings } from "@/lib/task/assignment-server"

/**
 * @example
 * ```ts
 * await GET(new Request("http://localhost/tasks/assignments?projectId=project-1"))
 * ```
 */
export async function GET(request: Request) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("projectId")?.trim() || null
  const bindings = await listTaskProjectBindings()

  return Response.json({
    ok: true,
    bindings: projectId ? filterTaskProjectBindingsForProject(bindings, projectId) : bindings,
  })
}
