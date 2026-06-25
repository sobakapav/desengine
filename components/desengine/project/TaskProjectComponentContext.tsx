"use client"

import { useTaskProjectComponent } from "./useTaskProjectComponent"

type TaskProjectComponentContextProps = {
  taskId: string
  projectId?: string | null
  componentId?: string | null
  mode?: "compact" | "detail"
}

/**
 * @example
 * ```tsx
 * <TaskProjectComponentContext taskId="task-1" projectId="project-1" mode="compact" />
 * ```
 */
function TaskProjectComponentContext({
  taskId,
  projectId,
  componentId,
  mode = "compact",
}: TaskProjectComponentContextProps) {
  const state = useTaskProjectComponent(taskId, projectId, componentId)

  if (state.status !== "ready" || !state.component) {
    return null
  }

  if (mode === "detail") {
    return (
      <p className="mt-3 text-lg text-black/80">
        Сейчас вы работаете над компонентом <strong>{state.component.title}</strong>. Эта задача
        помогает продолжать ту же работу внутри проекта без потери контекста.
      </p>
    )
  }

  return (
    <p className="text-sm text-black/70">
      Компонент: <strong>{state.component.title}</strong>
    </p>
  )
}

export { TaskProjectComponentContext }
