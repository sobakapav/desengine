"use client"

import type { TaskProjectBinding } from "@/lib/task/assignment"
import type { TaskListItem } from "@/lib/task/types"

import { TaskItemList } from "./TaskCard"
import { indexTaskProjectBindings } from "@/lib/task/assignment"

type TasksScreenProps = {
  tasks: TaskListItem[]
  bindings: TaskProjectBinding[]
}

/**
 * @example
 * ```tsx
 * <TasksScreen tasks={tasks} bindings={bindings} />
 * ```
 */
export function TasksScreen({ tasks, bindings }: TasksScreenProps) {
  const bindingsByTaskId = indexTaskProjectBindings(bindings)
  const assignedCount = bindings.length

  return (
    <main className="px-5 py-5">
      <h1 className="text-8xl py-2">Задачи</h1>
      <h2 className="text-6xl py-2">Всего задач: {tasks.length}</h2>
      <p className="max-w-4xl py-2 text-xl text-black/70">
        Здесь видны все рабочие задачи. Если задача уже живёт внутри проекта, карточка сразу
        показывает эту связь. Если ещё нет, это тоже видно без перехода вглубь.
      </p>
      <p className="text-lg text-black/70">
        С проектом уже связаны: <strong>{assignedCount}</strong> из <strong>{tasks.length}</strong>.
      </p>

      <TaskItemList
        tasks={tasks}
        bindingsByTaskId={bindingsByTaskId}
        className="grid grid-cols-1 gap-4 py-4 md:grid-cols-2 xl:grid-cols-3"
      />
    </main>
  )
}
