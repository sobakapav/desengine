import type { Project } from "@/lib/project/runtime"

/**
 * Лабораторные адреса
 */

import { getDefaultCodeScreen } from "./editor"

/** Корневой адрес для всех лабораторий */
function getLabRootUrl() {
  return `/lab`
}

/** URL к конкретной лаборатории (+ код) */
function getLabUrl(taskId: string, screen?: string | null, project?: Project) {
  const labRootUrl = getLabRootUrl()
  const defaultCodeScreen = getDefaultCodeScreen()
  const path = !screen || screen === defaultCodeScreen
    ? `${labRootUrl}/${encodeURIComponent(taskId)}`
    : `${labRootUrl}/${encodeURIComponent(taskId)}/${encodeURIComponent(screen)}`

  if (!project) {
    return path
  }

  const params = new URLSearchParams({
    projectId: project.id,
    projectTitle: project.title,
    uiKitId: project.settings.uiKitId,
  })

  return `${path}?${params.toString()}`
}

export {
    getLabRootUrl,
    getLabUrl
}
