import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectWorkspaceActivity } from "@/lib/project/workspace-session"

type ProjectHistoryEvent = {
  id: string
  createdAt: string
  componentTitle: string | null
  kind: ProjectWorkspaceActivity["kind"]
  message: string
}

type ProjectHistoryDiagnosticsSummary = {
  eventCount: number
  focusChangeCount: number
  createdComponentCount: number
  completedComponentCount: number
  lastActivityAt: string | null
}

type ProjectHistoryDiagnosticsSnapshot = {
  projectId: string
  events: ProjectHistoryEvent[]
  summary: ProjectHistoryDiagnosticsSummary
}

function clipTextPreview(value: string, maxLength = 140) {
  const normalized = value.replace(/\s+/g, " ").trim()
  if (!normalized) {
    return "Сообщение активности пока пустое"
  }

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`
}

function buildProjectHistoryDiagnosticsSummary(args: {
  activities: ProjectWorkspaceActivity[]
  components: ProjectComponent[]
}): ProjectHistoryDiagnosticsSummary {
  const lastActivityAt = [
    ...args.activities.map((activity) => activity.createdAt),
    ...args.components.map((component) => component.updatedAt),
  ]
    .filter((value): value is string => typeof value === "string" && value.trim().length > 0)
    .sort((left, right) => right.localeCompare(left))[0] ?? null

  return {
    eventCount: args.activities.length,
    focusChangeCount: args.activities.filter((activity) => activity.kind === "project-focus-set" || activity.kind === "project-focus-cleared").length,
    createdComponentCount: args.activities.filter((activity) => activity.kind === "project-component-created").length,
    completedComponentCount: args.components.filter((component) => component.status === "completed").length,
    lastActivityAt,
  }
}

function buildProjectHistoryDiagnosticsSnapshot(
  projectId: string,
  activities: ProjectWorkspaceActivity[],
  components: ProjectComponent[],
): ProjectHistoryDiagnosticsSnapshot {
  return {
    projectId,
    events: activities.map((activity) => ({
      id: activity.id,
      createdAt: activity.createdAt,
      componentTitle: activity.componentTitle,
      kind: activity.kind,
      message: clipTextPreview(activity.message, 180),
    })),
    summary: buildProjectHistoryDiagnosticsSummary({
      activities,
      components,
    }),
  }
}

export {
  buildProjectHistoryDiagnosticsSnapshot,
  buildProjectHistoryDiagnosticsSummary,
  clipTextPreview,
}

export type {
  ProjectHistoryDiagnosticsSnapshot,
  ProjectHistoryDiagnosticsSummary,
  ProjectHistoryEvent,
}
