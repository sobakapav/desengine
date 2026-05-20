import { readFile } from "node:fs/promises"
import path from "node:path"

import { requireAccessOrUnauthorizedResponse } from "@/lib/auth/server"
import {
  buildSandpackPreviewPayload,
  type SandpackPreviewSourceFiles,
} from "@/lib/lab/sandpack-preview"
import {
  buildLevelTemplateRuntimeSource,
  readLevelSandpackTemplate,
} from "@/lib/lab/sandpack-template"
import { normalizeSandpackUiKitId } from "@/lib/lab/sandpack-ui-kits.config"
import { normalizeProject, resolveProjectPreviewConfig } from "@/lib/project/runtime"
import { getLevelsCatalog, getTaskListItemById } from "@/lib/system/server"
import { getUserTaskFilePath } from "@/lib/user/server"
import { readFilesRecursively } from "@/lib/system/shadcn-files"

type Params = { taskId: string }

export const dynamic = "force-dynamic"
export const revalidate = 0

const uiBadgePath = path.join(process.cwd(), "components", "ui", "badge.tsx")
const systemUtilsPath = path.join(process.cwd(), "lib", "system", "utils.ts")

async function readUserTaskFile(taskId: string, fileName: string, fallback = "") {
  return readFile(getUserTaskFilePath(taskId, fileName), "utf-8").catch(() => fallback)
}

const defaultSandpackUiKitId = normalizeSandpackUiKitId(process.env.SANDPACK_UI_KIT)

function pickPreviewLevelNumber(taskItem: { progress: { currentLevel: number, currentLevelNotStarted: boolean } }) {
  if (taskItem.progress.currentLevel <= 1) {
    return 1
  }

  if (taskItem.progress.currentLevelNotStarted) {
    return taskItem.progress.currentLevel - 1
  }

  return taskItem.progress.currentLevel
}

export async function GET(
  request: Request,
  { params }: { params: Promise<Params> },
) {
  const unauthorizedResponse = await requireAccessOrUnauthorizedResponse()
  if (unauthorizedResponse) return unauthorizedResponse

  const { taskId } = await params
  const { searchParams } = new URL(request.url)
  const project = normalizeProject({
    id: searchParams.get("projectId") ?? `task-${taskId}`,
    title: searchParams.get("projectTitle") ?? "Локальный проект",
    uiKitId: searchParams.get("uiKitId") ?? defaultSandpackUiKitId,
    uiMode: searchParams.get("uiMode") ?? "html-tags",
  })
  const projectPreviewConfig = resolveProjectPreviewConfig(project)
  const taskItem = await getTaskListItemById(taskId)

  if (!taskItem) {
    return Response.json({ ok: false, error: "Задание не найдено" }, { status: 404 })
  }

  const levels = await getLevelsCatalog()
  const previewLevelNumber = pickPreviewLevelNumber(taskItem)
  const previewLevel = levels.find((level) => level.number === previewLevelNumber) ?? null

  if (!previewLevel) {
    return Response.json(
      { ok: false, error: `Уровень ${previewLevelNumber} не найден в каталоге` },
      { status: 500 },
    )
  }

  const [levelTemplate, levelTemplateRuntimeSource] = await Promise.all([
    readLevelSandpackTemplate(previewLevel.id),
    Promise.resolve(buildLevelTemplateRuntimeSource({
      levelId: previewLevel.id,
      levelNumber: previewLevel.number,
      labId: previewLevel.labId,
    })),
  ])

  const [
    component,
    stories,
    styles,
    mock,
    props,
    systemUtils,
  ] = await Promise.all([
    readUserTaskFile(taskId, "Component.tsx"),
    readUserTaskFile(taskId, "Component.stories.ts", "export {};\n"),
    readUserTaskFile(taskId, "styles.ts", "export const styles = {};\n"),
    readUserTaskFile(taskId, "mock.ts", "export const mock = {};\n"),
    readUserTaskFile(taskId, "props.ts", "export {};\n"),
    readFile(systemUtilsPath, "utf-8"),
  ])

  const [uiBadge, shadcnFiles] = projectPreviewConfig.effectiveUiKitId === "shadcn"
    ? await Promise.all([
      readFile(uiBadgePath, "utf-8"),
      readFilesRecursively(
        path.join(process.cwd(), "components", "ui"),
        "/components/ui"
      ),
    ])
    : ["", {} as Record<string, string>]

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
    systemUtils,
    uiBadge,
    shadcnFiles,
  }

  return Response.json(
    {
      ok: true,
      ...buildSandpackPreviewPayload(sourceFiles, {
        project,
        appTemplate: {
          appTsx: levelTemplate.appTsx,
          previewCss: levelTemplate.previewCss,
          levelTemplateRuntime: levelTemplateRuntimeSource,
        },
      }),
    },
    {
      headers: {
        "cache-control": "no-store, no-cache, must-revalidate",
      },
    },
  )
}
