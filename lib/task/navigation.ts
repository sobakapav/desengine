/** Корневой URL-адрес для всех задач */
function getTasksRootUrl() {
  return `/tasks`
}

/** URL-адрес информационной страницы конкретной задачи */
function getTaskUrl(taskId: string) {
  const tasksRootUrl = getTasksRootUrl();
  return `${tasksRootUrl}/${encodeURIComponent(taskId)}`
}





// ? И тогда зачем эти функции?
export function createTaskNextPath(taskId: string) {
  return `/tasks/${encodeURIComponent(taskId)}/next`
}

export function createTaskDonePath(taskId: string) {
  return `/tasks/${encodeURIComponent(taskId)}/done`
}

export function createTaskCheckPath(taskId: string) {
  return `/tasks/${encodeURIComponent(taskId)}/check`
}















export {
    getTasksRootUrl,
    getTaskUrl,
}