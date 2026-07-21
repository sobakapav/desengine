import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import { createServerProjectStorage, readProjectRootPath } from "@/lib/project/storage-disk"
import { readProjectSurfaceSummary } from "../project-surface-summary"

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
    const [project, activeProjectId] = await Promise.all([
      storage.getProject(projectId),
      storage.getActiveProjectId(),
    ])
    const rootPath = project ? await readProjectRootPath(project.id) : null

    return Response.json({
      ok: true,
      project,
      rootPath,
      activeProjectId,
      surface: project && rootPath ? await readProjectSurfaceSummary(rootPath, project) : null,
    })
  } catch (error) {
    return createErrorResponse(error, "Не удалось прочитать проект.", 500)
  }
}

export async function PUT(request: Request, { params }: { params: Promise<Params> }) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    await params
    const body = await request.json() as {
      metadata?: {
        code?: string | null
      }
      project?: ProjectWorkspace
      previousProjectId?: string | null
    }

    if (!body?.project) {
      return Response.json({ ok: false, error: "Нужен project payload для сохранения." }, { status: 400 })
    }

    const storage = createServerProjectStorage()
    await storage.saveProject(body.project, body.previousProjectId)
    const rootPath = await readProjectRootPath(body.project.id)

    return Response.json({
      ok: true,
      project: body.project,
      rootPath,
      surface: rootPath ? await readProjectSurfaceSummary(rootPath, body.project) : null,
    })
  } catch (error) {
    return createErrorResponse(error, "Не удалось сохранить проект.")
  }
}
