import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { createServerProjectStorage, runProjectWorkspaceAction } from "@/lib/project/storage-disk"

type ProjectWorkspaceActionRequest =
  | { type: "start-project-work" }
  | { type: "create-component"; title: string }
  | { type: "start-component-work"; componentId: string }
  | { type: "complete-component"; componentId: string }
  | { type: "reopen-component"; componentId: string }

function createErrorResponse(error: unknown, fallback: string, status = 400) {
  return Response.json(
    { ok: false, error: error instanceof Error ? error.message : fallback },
    { status },
  )
}

type Params = {
  projectId: string
}

export async function GET(_: Request, { params }: { params: Promise<Params> }) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const { projectId } = await params
    const storage = createServerProjectStorage()
    const snapshot = await storage.readWorkspaceSnapshot(projectId)

    return Response.json({
      ok: true,
      snapshot,
    })
  } catch (error) {
    return createErrorResponse(error, "Не удалось прочитать рабочее состояние проекта.", 500)
  }
}

export async function POST(request: Request, { params }: { params: Promise<Params> }) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const { projectId } = await params
    const action = await request.json() as ProjectWorkspaceActionRequest
    const snapshot = await runProjectWorkspaceAction({ action, projectId })

    return Response.json({
      ok: true,
      snapshot,
    })
  } catch (error) {
    return createErrorResponse(error, "Не удалось обновить рабочее состояние проекта.")
  }
}
