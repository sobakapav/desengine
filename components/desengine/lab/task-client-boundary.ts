import type { Project } from "@/lib/project/runtime"

export function buildTaskOpenUrl(taskId: string, project: Project) {
  const params = new URLSearchParams({
    projectId: project.id,
    projectTitle: project.title,
    uiKitId: project.settings.uiKitId,
    uiMode: project.settings.uiMode,
  })

  return `/api/tasks/${taskId}?${params.toString()}`
}

export async function postTaskStart(taskId: string, project: Project) {
  return fetch(`/api/tasks/${taskId}/start`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ project }),
  })
}
