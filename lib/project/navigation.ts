/** Корневой URL-адрес раздела проектов */
function getProjectsRootUrl() {
  return "/projects"
}

/** URL-адрес страницы конкретного проекта */
function getProjectUrl(projectId: string) {
  return `${getProjectsRootUrl()}/${encodeURIComponent(projectId)}`
}

/** URL-адрес страницы конкретного верстака проекта */
function getProjectWorkbenchUrl(projectId: string, sessionId: string) {
  return `${getProjectUrl(projectId)}/workbenches/${encodeURIComponent(sessionId)}`
}

export {
  getProjectUrl,
  getProjectWorkbenchUrl,
  getProjectsRootUrl,
}
