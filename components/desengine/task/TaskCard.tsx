import Link from "next/link"
import { getProjectUrl } from "@/lib/project/navigation"
import { getTaskUrl } from "@/lib/task/navigation"
import { getLabUrl } from "@/lib/lab/navigation"
import { TaskProjectComponentContext } from "@/components/desengine/project/TaskProjectComponentContext"

import { ProgressDots } from "./ProgressDots"
import { TaskItemProps as TaskCardProps, TaskItemListProps } from "./props"

/** Карточка задачи в разных списках */
function TaskCard({
  task,
  binding,
  className = "flex w-full gap-1",
}: TaskCardProps) {
  return (
    <article
      key={task.id}
      className={`rounded-3xl border border-black/10 bg-white p-4 shadow-sm ${className}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={getTaskUrl(task.id)}
            className="text-2xl font-bold text-black transition-opacity hover:opacity-50"
          >
            {task.id}
          </Link>
          <Link
            href={getLabUrl(task.id)}
            className="rounded-full border border-black/15 px-3 py-1 text-sm text-black/70 transition-opacity hover:opacity-60"
          >
            Открыть работу
          </Link>
        </div>

        {binding ? (
          <>
            <p className="text-sm text-black/70">
              Проект:{" "}
              <Link className="font-medium text-black underline-offset-4 hover:underline" href={getProjectUrl(binding.projectId)}>
                {binding.projectTitle}
              </Link>
            </p>
            <TaskProjectComponentContext componentId={binding.componentId} projectId={binding.projectId} taskId={task.id} />
          </>
        ) : (
          <p className="text-sm text-black/50">
            Проект для этой работы пока не зафиксирован.
          </p>
        )}

        <ProgressDots
          total={task.maxLevel}
          completed={task.progress.currentLevel}
        />
      </div>
    </article>
  )
}

function TaskItemList({
  tasks,
  bindingsByTaskId = {},
  className = "grid grid-cols-3",
}: TaskItemListProps) {
  return (
    <div className={className}>
      {tasks.map((task) => {
        return (
          <TaskCard
            key={task.id}
            task={task}
            binding={bindingsByTaskId[task.id]}
          />
        )
      })}
    </div>
  )
}

export { TaskCard as TaskItem, TaskItemList }
