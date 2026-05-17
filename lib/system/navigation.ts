import { getDefaultCodeScreen } from "@/lib/lab/editor"
import {
  getLabRootUrl,
  getLabUrl,
} from "@/lib/lab/navigation"
import {
  createTaskCheckPath,
  createTaskDonePath,
  createTaskNextPath,
  getTasksRootUrl,
  getTaskUrl,
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

function isAccessibleTaskScreen(screen: string, allowedScreens: string[]) {
  const defaultCodeScreen = getDefaultCodeScreen()

  if (screen === defaultCodeScreen) {
    return true
  }

  return allowedScreens.includes(screen)
}

export {
  createLabUrl,
  createTaskCheckPath,
  createTaskDonePath,
  createTaskNextPath,
  getLabRootUrl,
  getLabUrl,
  getLevelAssetPath,
  getLevelsRootUrl,
  getLevelUrl,
  getSystemUrl,
  getTasksRootUrl,
  getTaskUrl,
  isAccessibleTaskScreen,
}
