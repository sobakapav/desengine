/** Корневой URL-адрес раздела проектов */
function getProjectsRootUrl() {
  return "/projects"
}

/** URL-адрес страницы конкретного проекта */
function getProjectUrl(projectId: string) {
  return `${getProjectsRootUrl()}/${encodeURIComponent(projectId)}`
}

export {
  getProjectUrl,
  getProjectsRootUrl,
}
