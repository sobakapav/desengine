import { readFile } from "node:fs/promises"
import path from "node:path"

import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import {
  buildSandpackPreviewPayload,
  type SandpackPreviewSourceFiles,
} from "@/lib/lab/sandpack-preview"
import { getTaskListItemById } from "@/lib/system/server"
import { getUserTaskFilePath } from "@/lib/user/server"

type Params = { taskId: string }

export const dynamic = "force-dynamic"
export const revalidate = 0

const uiBadgePath = path.join(process.cwd(), "components", "ui", "badge.tsx")
const systemUtilsPath = path.join(process.cwd(), "lib", "system", "utils.ts")

async function readUserTaskFile(taskId: string, fileName: string, fallback = "") {
  return readFile(getUserTaskFilePath(taskId, fileName), "utf-8").catch(() => fallback)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    return Response.json({ ok: false, error: "Задание не найдено" }, { status: 404 })
  }

  const [
    component,
    stories,
    styles,
    mock,
    props,
    uiBadge,
    systemUtils,
  ] = await Promise.all([
    readUserTaskFile(taskId, "Component.tsx"),
    readUserTaskFile(taskId, "Component.stories.ts", "export {};\n"),
    readUserTaskFile(taskId, "styles.ts", "export const styles = {};\n"),
    readUserTaskFile(taskId, "mock.ts", "export const mock = {};\n"),
    readUserTaskFile(taskId, "props.ts", "export {};\n"),
    readFile(uiBadgePath, "utf-8"),
    readFile(systemUtilsPath, "utf-8"),
  ])

  if (!component.trim()) {
    return Response.json(
      { ok: false, error: "Component.tsx пуст или недоступен" },
      { status: 404 },
    )
  }

  const sourceFiles: SandpackPreviewSourceFiles = {
    component,
    stories,
    styles,
    mock,
    props,
    uiBadge,
    systemUtils,
  }

  return Response.json(
    {
      ok: true,
      ...buildSandpackPreviewPayload(sourceFiles),
    },
    {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    },
  )
}
