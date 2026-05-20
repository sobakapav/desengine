import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import { normalizeSandpackUiKitId } from "@/lib/lab/sandpack-ui-kits.config"
import { normalizeProject } from "@/lib/project/runtime"
import { getTaskLevelHint, getTaskListItemById } from "@/lib/system/server"
import { appConfig } from "@/lib/system/config/server"
import { readdir } from "node:fs/promises"

type Params = { taskId: string }

export const dynamic = "force-dynamic"
export const revalidate = 0

const defaultSandpackUiKitId = normalizeSandpackUiKitId(process.env.SANDPACK_UI_KIT)

function parseProjectFromRequest(request: Request, taskId: string) {
  const { searchParams } = new URL(request.url)

  return normalizeProject({
    id: searchParams.get("projectId") ?? `task-${taskId}`,
    title: searchParams.get("projectTitle") ?? "Локальный проект",
    uiKitId: searchParams.get("uiKitId") ?? defaultSandpackUiKitId,
    uiMode: searchParams.get("uiMode"),
  })
}

/**
 * @example
 * ```ts
 * await GET(new Request("http://localhost/api/tasks/task-1/hint?uiKitId=ant"), {
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
  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    const taskDirs = await readdir(appConfig.taskCatalogRoot, { withFileTypes: true }).catch(() => [])
    const taskIds = taskDirs.filter((entry) => entry.isDirectory()).map((entry) => entry.name).sort()
    return Response.json(
      {
        ok: false,
        error: "Задание не найдено",
        debug: {
          taskId,
          taskCatalogRoot: appConfig.taskCatalogRoot,
          existsInCatalog: taskIds.includes(taskId),
          sampleTaskIds: taskIds.slice(0, 20),
        },
      },
      { status: 404 },
    )
  }

  const project = parseProjectFromRequest(request, taskId)
  const taskTip = await getTaskLevelHint(taskItem, project)

  return Response.json({ ok: true, taskTip })
}
