import { getDefaultCodeScreen } from "@/lib/lab/editor"
import {
  getLabRootUrl,
  getLabUrl,
} from "@/lib/lab/navigation"
import {
  createTaskCheckPath,
  createTaskDonePath,
  createTaskNextPath,
  createTaskTransitionPath,
  getTasksRootUrl,
  getTaskUrl,
  taskTransitionScreens,
  type TaskTransitionScreen,
} from "@/lib/task/navigation"
import {
  getLevelAssetPath,
  getLevelsRootUrl,
  getLevelUrl,
} from "@/lib/level/navigation"

/** URL dashboard'а системы */
function getSystemUrl() {
  return "/system"
}

function createLabUrl(taskId: string, screen?: string | null) {
  return getLabUrl(taskId, screen)
}

function createLabLegacyTransitionRedirectPath(taskId: string, screen: TaskTransitionScreen) {
  return createTaskTransitionPath(taskId, screen)
}

function isTaskTransitionScreen(screen: string): screen is TaskTransitionScreen {
  return taskTransitionScreens.includes(screen as TaskTransitionScreen)
}

function isAccessibleTaskScreen(screen: string, allowedScreens: string[]) {
  const defaultCodeScreen = getDefaultCodeScreen()

  if (screen === defaultCodeScreen) {
    return true
  }

  return allowedScreens.includes(screen)
}

export {
  createLabLegacyTransitionRedirectPath,
  createLabUrl,
  createTaskCheckPath,
  createTaskDonePath,
  createTaskNextPath,
  createTaskTransitionPath,
  getLabRootUrl,
  getLabUrl,
  getLevelAssetPath,
  getLevelsRootUrl,
  getLevelUrl,
  getSystemUrl,
  getTasksRootUrl,
  getTaskUrl,
  isAccessibleTaskScreen,
  isTaskTransitionScreen,
  taskTransitionScreens,
}

export type { TaskTransitionScreen }
