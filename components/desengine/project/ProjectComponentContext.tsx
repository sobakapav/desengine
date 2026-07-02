"use client"

import { useProjectComponent } from "./useProjectComponent"

type ProjectComponentContextProps = {
  projectId?: string | null
  componentId?: string | null
  mode?: "compact" | "detail"
}

/**
 * @example
 * ```tsx
 * <ProjectComponentContext projectId="project-1" componentId="component-1" mode="compact" />
 * ```
 */
function ProjectComponentContext({
  projectId,
  componentId,
  mode = "compact",
}: ProjectComponentContextProps) {
  const state = useProjectComponent(projectId, componentId)

  if (state.status !== "ready" || !state.component) {
    return null
  }

  if (mode === "detail") {
    return (
      <p className="mt-3 text-lg text-black/80">
        Сейчас вы работаете над компонентом <strong>{state.component.title}</strong>. Текущий
        экран продолжает ту же проектную работу без потери контекста.
      </p>
    )
  }

  return (
    <p className="text-sm text-black/70">
      Компонент: <strong>{state.component.title}</strong>
    </p>
  )
}

export { ProjectComponentContext }
