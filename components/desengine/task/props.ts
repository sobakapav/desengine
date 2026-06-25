import type { TaskData, TaskListItem } from "@/lib/task/types"
import type { TaskProjectBinding } from "@/lib/task/assignment"
import type { BaseProps } from "../system/Base"

type TaskItemProps = BaseProps & {
    task: TaskListItem
    binding?: TaskProjectBinding | null
}

type TaskItemListProps = BaseProps & {
  tasks: TaskListItem[]
  bindingsByTaskId?: Record<string, TaskProjectBinding>
}

type TaskLevelStartProps = {
  taskItem: TaskListItem
  taskData: TaskData
  startStatus: "" | "starting"
  startError: string
  onStart: () => void
  onBackToLevelList: () => void
}

export type {
  TaskLevelStartProps,
  TaskItemListProps,
  TaskItemProps,
}
