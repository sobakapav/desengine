/**
 * Лабораторные адреса
 */

import { getDefaultCodeScreen } from "./editor"

/** Корневой адрес для всех лабораторий */
function getLabRootUrl() {
  return `/lab`
}

/** URL к конкретной лаборатории (+ код) */
function getLabUrl(taskId: string, screen?: string | null) {
  const labRootUrl = getLabRootUrl()
  const defaultCodeScreen = getDefaultCodeScreen()

  if (!screen || screen === defaultCodeScreen) {
    return `${labRootUrl}/${encodeURIComponent(taskId)}`
  }

  return `${labRootUrl}/${encodeURIComponent(taskId)}/${encodeURIComponent(screen)}`
}

export {
    getLabRootUrl,
    getLabUrl
}