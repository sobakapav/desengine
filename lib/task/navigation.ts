import { getLabUrl } from "@/lib/lab/navigation"

const taskTransitionScreens = ["check", "done", "next"] as const

type TaskTransitionScreen = (typeof taskTransitionScreens)[number]

/** Корневой URL-адрес для всех задач */
function getTasksRootUrl() {
  return "/tasks"
}

/** URL-адрес информационной страницы конкретной задачи */
function getTaskUrl(taskId: string) {
  const tasksRootUrl = getTasksRootUrl()
  return `${tasksRootUrl}/${encodeURIComponent(taskId)}`
}

function createTaskCheckPath(taskId: string) {
  return `${getTaskUrl(taskId)}/check`
}

function createTaskDonePath(taskId: string) {
  return `${getTaskUrl(taskId)}/done`
}

function createTaskNextPath(taskId: string) {
  return getLabUrl(taskId)
}

function createTaskTransitionPath(taskId: string, screen: TaskTransitionScreen) {
  const transitionPathByScreen: Record<TaskTransitionScreen, string> = {
    check: createTaskCheckPath(taskId),
    done: createTaskDonePath(taskId),
    next: createTaskNextPath(taskId),
  }

  return transitionPathByScreen[screen]
}

export {
  createTaskCheckPath,
  createTaskDonePath,
  createTaskNextPath,
  createTaskTransitionPath,
  getTasksRootUrl,
  getTaskUrl,
  taskTransitionScreens,
}

export type { TaskTransitionScreen }
