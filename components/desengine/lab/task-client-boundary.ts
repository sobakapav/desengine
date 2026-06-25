import { normalizeProject, type Project } from "@/lib/project/runtime"

/**
 * @example
 * ```ts
 * const url = buildTaskOpenUrl("task-1", project)
 * // /api/tasks/task-1?projectId=project-1&projectTitle=Alpha&uiKitId=ant
 * ```
 */
export function buildTaskOpenUrl(taskId: string, project: Project) {
  const params = new URLSearchParams({
    projectId: project.id,
    projectTitle: project.title,
    uiKitId: project.settings.uiKitId,
  })

  return `/api/tasks/${taskId}?${params.toString()}`
}

export function readProjectFromTaskUrl(taskId: string): Project | null {
  if (typeof window === "undefined") {
    return null
  }

  const searchParams = new URLSearchParams(window.location.search)
  const hasProjectContext = ["projectId", "projectTitle", "uiKitId"]
    .some((key) => searchParams.get(key)?.trim())

  if (!hasProjectContext) {
    return null
  }

  return normalizeProject({
    id: searchParams.get("projectId") ?? `task-${taskId}`,
    title: searchParams.get("projectTitle") ?? `Проект ${taskId}`,
    settings: {
      uiKitId: searchParams.get("uiKitId"),
    },
  })
}

/**
 * @example
 * ```ts
 * const response = await postTaskStart("task-1", project)
 * if (!response.ok) throw new Error("start failed")
 * ```
 */
export async function postTaskStart(taskId: string, project: Project, activeScreen?: string | null) {
  return fetch(`/api/tasks/${taskId}/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ project, activeScreen }),
  })
}
