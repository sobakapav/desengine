import "server-only"

import { readPromptHistory } from "@/lib/onboarding/repository"

import { summarizeTaskProgress } from "./progress"
import type {
  LevelConfig,
  LevelOverview,
  LevelOverviewTaskItem,
} from "../level/types"
import type { TaskListItem, TaskProgress } from "./types"
import { taskServerModel } from "./server-runtime-model"
import { taskServerProgress } from "./server-runtime-progress"
import { taskServerStorage } from "./server-runtime-storage"
import type { TaskCatalogItem } from "./server-runtime-types"

type TaskSnapshot = {
  task: TaskCatalogItem
  taskProgress: TaskProgress
}

async function loadTaskSnapshots(
  levels: LevelConfig[],
  tasks: TaskCatalogItem[],
  store: Awaited<ReturnType<typeof taskServerStorage.readUserProgressStore>>,
) {
  let changed = false
  const snapshots = await Promise.all(tasks.map(async (task) => {
    const taskProgress = taskServerProgress.ensureTaskProgress(store, task.id, task.config.maxLevel)
    const promptHistory = await readPromptHistory(task.id)
    changed = taskServerProgress.reconcileTaskProgressWithHistory(
      levels,
      task.config,
      taskProgress,
      promptHistory,
    ) || changed
    return { task, taskProgress }
  }))

  return { snapshots, changed }
}

function pickFallbackLevel(levels: LevelConfig[], snapshots: TaskSnapshot[]) {
  return levels.find((level) =>
    snapshots.some(({ task, taskProgress }) => {
      const summary = summarizeTaskProgress(levels, task.config, taskProgress)
      return summary.currentLevel === level.number && summary.currentLevelStatus !== "completed"
    }),
  ) ?? levels[0]
}

function splitOverviewTasks(
  levels: LevelConfig[],
  level: LevelConfig,
  snapshots: TaskSnapshot[],
) {
  const availableTasks: LevelOverviewTaskItem[] = []
  const passedTasks: LevelOverviewTaskItem[] = []

  for (const { task, taskProgress } of snapshots) {
    if (task.config.maxLevel < level.number) continue

    const taskItem = taskServerProgress.buildTaskListItem(task, levels, taskProgress)
    const isCurrentLevel = taskItem.progress.currentLevel === level.number

    if (isCurrentLevel && taskItem.progress.currentLevelStatus !== "completed") {
      availableTasks.push(taskServerProgress.buildPassedTaskItem(taskItem, null))
      continue
    }

    if (taskItem.progress.currentLevel > level.number) {
      passedTasks.push(taskServerProgress.buildPassedTaskItem(taskItem, taskItem.progress.currentLevel))
      continue
    }

    if (isCurrentLevel && taskItem.progress.currentLevelStatus === "completed") {
      passedTasks.push(taskServerProgress.buildPassedTaskItem(taskItem, null))
    }
  }

  return { availableTasks, passedTasks }
}

type TaskServerOverview = {
  getLevelsCatalog: () => Promise<LevelConfig[]>
  getLevelById: (levelId: string) => Promise<LevelConfig | null>
  getTasks: () => Promise<TaskListItem[]>
  getLevelOverview: (levelId?: string | null) => Promise<LevelOverview>
  getAllLevelOverviews: () => Promise<LevelOverview[]>
  getTaskListItemById: (taskId: string) => Promise<TaskListItem | null>
  getLevelForTaskItem: (taskItem: TaskListItem | null) => Promise<LevelConfig>
}

export const taskServerOverview: TaskServerOverview = {
  async getLevelsCatalog() {
    const catalog = await taskServerStorage.readLevelsCatalogRaw()
    return catalog.levels.slice().sort((a, b) => a.number - b.number)
  },
  async getLevelById(levelId: string) {
    const levels = await taskServerOverview.getLevelsCatalog()
    return levels.find((level) => level.id === levelId) ?? null
  },
  async getTasks() {
    const [levels, store, tasks] = await Promise.all([
      taskServerOverview.getLevelsCatalog(),
      taskServerStorage.readUserProgressStore(),
      taskServerStorage.readTaskCatalog(),
    ])
    const { snapshots, changed } = await loadTaskSnapshots(levels, tasks, store)

    if (changed) await taskServerStorage.writeUserProgressStore(store)

    return snapshots.map(({ task, taskProgress }) =>
      taskServerProgress.buildTaskListItem(task, levels, taskProgress),
    )
  },
  async getLevelOverview(levelId?: string | null): Promise<LevelOverview> {
    const [levels, store, tasks] = await Promise.all([
      taskServerOverview.getLevelsCatalog(),
      taskServerStorage.readUserProgressStore(),
      taskServerStorage.readTaskCatalog(),
    ])
    const { snapshots, changed } = await loadTaskSnapshots(levels, tasks, store)

    if (changed) await taskServerStorage.writeUserProgressStore(store)

    const fallbackLevel = pickFallbackLevel(levels, snapshots)
    const level = levels.find((item) => item.id === levelId) ?? fallbackLevel
    const { availableTasks, passedTasks } = splitOverviewTasks(levels, level, snapshots)
    const levelIndex = levels.findIndex((item) => item.id === level.id)

    return {
      level,
      availableTasks: availableTasks.sort((a, b) => a.id.localeCompare(b.id)),
      passedTasks: passedTasks.sort((a, b) => a.id.localeCompare(b.id)),
      prevLevelId: levelIndex > 0 ? levels[levelIndex - 1]?.id ?? null : null,
      nextLevelId: levelIndex < levels.length - 1 ? levels[levelIndex + 1]?.id ?? null : null,
    }
  },
  async getAllLevelOverviews(): Promise<LevelOverview[]> {
    const levels = await taskServerOverview.getLevelsCatalog()
    return Promise.all(levels.map((level) => taskServerOverview.getLevelOverview(level.id)))
  },
  async getTaskListItemById(taskId: string) {
    const taskListItems = await taskServerOverview.getTasks()
    return taskListItems.find((task) => task.id === taskId) ?? null
  },
  async getLevelForTaskItem(taskItem: Awaited<ReturnType<typeof taskServerOverview.getTaskListItemById>>) {
    if (!taskItem) throw new Error("Задание не найдено")
    const levels = await taskServerOverview.getLevelsCatalog()
    return taskServerModel.requireLevel(levels, taskItem.progress.currentLevel)
  },
}
