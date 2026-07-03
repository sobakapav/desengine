import type { ProjectComponent } from "@/lib/project/component-runtime"
import {
  listProjectWorkflowStages,
  type ProjectSession,
  type ProjectSessionStatus,
  type ProjectWorkflowStage,
  type ProjectWorkspaceActivity,
} from "@/lib/project/workspace-session"

type ProjectWorkflowReadoutEntry = {
  projectId: string
  componentId: string
  componentTitle: string
  componentStatus: ProjectComponent["status"]
  stageTitle: string
  stageStatus: ProjectWorkflowStage["status"]
  lastActivityAt: string | null
  notes: string[]
}

type ProjectWorkflowReadoutSnapshot = {
  projectId: string
  sessionStatus: ProjectSessionStatus
  currentStageId: ProjectWorkflowStage["id"]
  currentStageTitle: string
  lastActivityAt: string | null
  lastActivityLabel: string
  stages: ProjectWorkflowStage[]
  entries: ProjectWorkflowReadoutEntry[]
}

function formatWorkflowTimestamp(value: string | null) {
  if (!value) {
    return "ещё не зафиксирована"
  }

  const timestamp = new Date(value)
  if (Number.isNaN(timestamp.getTime())) {
    return "ещё не зафиксирована"
  }

  return `${timestamp.toISOString().slice(0, 16).replace("T", " ")} UTC`
}

function resolveCurrentStage(stages: ProjectWorkflowStage[]) {
  return stages.find((stage) => stage.status === "in_progress")
    ?? stages.find((stage) => stage.status === "not_started")
    ?? stages.at(-1)
    ?? {
      id: "project-structure",
      title: "Собрать состав проекта",
      description: "Проектная работа ещё не началась.",
      status: "not_started",
    }
}

function resolveComponentStage(component: ProjectComponent) {
  if (component.status === "completed") {
    return {
      title: "Компонент вошёл в согласованный слой проекта",
      status: "completed" as const,
      notes: [
        "Компонент уже отмечен как готовый внутри проекта.",
      ],
    }
  }

  if (component.status === "in_progress") {
    return {
      title: "Компонент находится в активной работе проекта",
      status: "in_progress" as const,
      notes: [
        "Проект может вести несколько компонентных линий параллельно.",
        "Следующий пользовательский шаг должен оставаться видимым на странице проекта.",
      ],
    }
  }

  return {
    title: "Компонент ещё не включён в активную работу проекта",
    status: "not_started" as const,
    notes: [
      "Компонент уже принадлежит проекту, но его рабочая линия ещё не запущена.",
    ],
  }
}

function buildProjectWorkflowReadoutSnapshot(args: {
  projectId: string
  activities: ProjectWorkspaceActivity[]
  components: ProjectComponent[]
  session: ProjectSession | null
}): ProjectWorkflowReadoutSnapshot {
  const completedComponentCount = args.components.filter((component) => component.status === "completed").length
  const inProgressComponentCount = args.components.filter((component) => component.status === "in_progress").length
  const stages = listProjectWorkflowStages({
    componentCount: args.components.length,
    completedComponentCount,
    inProgressComponentCount,
    sessionStatus: args.session?.status ?? "idle",
  })
  const currentStage = resolveCurrentStage(stages)

  const lastActivityAt = [
    args.session?.lastActivityAt ?? null,
    ...args.activities.map((activity) => activity.createdAt),
    ...args.components.map((component) => component.updatedAt),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .sort((left, right) => right.localeCompare(left))[0] ?? null

  const entries = [...args.components]
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))
    .map((component) => {
      const activity = args.activities.find((entry) => entry.componentId === component.id) ?? null
      const stage = resolveComponentStage(component)

      return {
        projectId: args.projectId,
        componentId: component.id,
        componentTitle: component.title,
        componentStatus: component.status,
        stageTitle: stage.title,
        stageStatus: stage.status,
        lastActivityAt: activity?.createdAt ?? component.updatedAt,
        notes: stage.notes,
      } satisfies ProjectWorkflowReadoutEntry
    })

  return {
    projectId: args.projectId,
    sessionStatus: args.session?.status ?? "idle",
    currentStageId: currentStage.id,
    currentStageTitle: currentStage.title,
    lastActivityAt,
    lastActivityLabel: formatWorkflowTimestamp(lastActivityAt),
    stages,
    entries,
  }
}

export { buildProjectWorkflowReadoutSnapshot }

export type {
  ProjectWorkflowReadoutEntry,
  ProjectWorkflowReadoutSnapshot,
}
