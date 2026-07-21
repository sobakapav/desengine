import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { createServerProjectStorage, readProjectRootPath } from "@/lib/project/storage-disk"
import { readProjectSurfaceSummary } from "./project-surface-summary"

function createErrorResponse(error: unknown, fallback: string, status = 400) {
  return Response.json(
    { ok: false, error: error instanceof Error ? error.message : fallback },
    { status },
  )
}

export async function GET() {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const storage = createServerProjectStorage()
    const [projects, activeProjectId] = await Promise.all([
      storage.listProjects(),
      storage.getActiveProjectId(),
    ])
    const projectsWithPaths = await Promise.all(
      projects.map(async (project) => {
        const rootPath = await readProjectRootPath(project.id) ?? ""

        return {
          project,
          rootPath,
          surface: rootPath
            ? await readProjectSurfaceSummary(rootPath, project)
            : null,
        }
      }),
    )

    return Response.json({
      ok: true,
      projects: projectsWithPaths,
      activeProjectId,
    })
  } catch (error) {
    return createErrorResponse(error, "Не удалось прочитать project registry.", 500)
  }
}

export async function POST(request: Request) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  try {
    const body = await request.json()
    const storage = createServerProjectStorage()

    if (body?.mode === "connect") {
      const project = await storage.connectProject(body.rootPath)
      const rootPath = await readProjectRootPath(project.id)
      return Response.json({
        ok: true,
        project,
        rootPath,
        surface: rootPath ? await readProjectSurfaceSummary(rootPath, project) : null,
      })
    }

    const project = await storage.createProject({
      code: body?.code,
      id: body?.id,
      metadata: {
        code: body?.code,
        title: body?.title,
        uiKitId: body?.uiKitId,
      },
      title: body?.title,
      rootPath: body?.rootPath,
      settings: {
        uiKitId: body?.uiKitId,
      },
    })
    await storage.setActiveProjectId(project.id)
    const rootPath = await readProjectRootPath(project.id)

    return Response.json({
      ok: true,
      project,
      rootPath,
      surface: rootPath ? await readProjectSurfaceSummary(rootPath, project) : null,
    })
  } catch (error) {
    return createErrorResponse(error, "Не удалось создать или подключить проект.")
  }
}
