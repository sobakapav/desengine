import type { ProjectWorkbenchSession } from "@/lib/project/workbench"

import { getProjectWorkbenchUrl } from "@/lib/project/navigation"
import { formatProjectSurfaceTimestamp } from "./projectSurfaceShared"

type ProjectWorkbenchSurfaceModel = {
  id: string
  title: string
  scopeLabel: string
  projectLabel: string
  subjectLabel: string
  workflowLabel: string
  linkageLabel: string
  statusLabel: string
  accessLabel: string
  summary: string
  lockReason: string
  lastActivityLabel: string
  previewHref: string
  notes: string[]
}

function buildWorkbenchNotes(session: ProjectWorkbenchSession) {
  const notes = [
    `Workflow definition: ${session.workflowDefinitionId}.`,
    "Сессия materialized только для просмотра и проверки связей.",
  ]

  if (session.subject.kind === "component") {
    notes.unshift(`Компонентная привязка: ${session.subject.title}.`)
  } else {
    notes.unshift("Вертак привязан ко всему проекту, а не к отдельному компоненту.")
  }

  if (session.linkedComponentId) {
    notes.push(`Linked component id: ${session.linkedComponentId}.`)
  }

  return notes
}

function buildProjectWorkbenchSurfaceModel(
  projectId: string,
  session: ProjectWorkbenchSession,
): ProjectWorkbenchSurfaceModel {
  return {
    id: session.id,
    title: session.title,
    scopeLabel: session.subject.kind === "project" ? "Проектный слой" : "Компонент внутри проекта",
    projectLabel: session.projectTitle,
    subjectLabel: session.subject.title,
    workflowLabel: session.workflowTitle,
    linkageLabel: session.subject.kind === "project"
      ? "Этот верстак связан со всем проектом"
      : "Этот верстак связан с конкретным компонентом проекта",
    statusLabel: "Materialized preview",
    accessLabel: session.status === "locked" ? "Locked" : session.status,
    summary: session.summary,
    lockReason: session.lockReason,
    lastActivityLabel: formatProjectSurfaceTimestamp(session.lastActivityAt ?? ""),
    previewHref: getProjectWorkbenchUrl(projectId, session.id),
    notes: buildWorkbenchNotes(session),
  }
}

/**
 * @example
 * ```ts
 * const models = buildProjectWorkbenchSurfaceModels({
 *   projectId: "project-a",
 *   sessions: [],
 * })
 * ```
 */
function buildProjectWorkbenchSurfaceModels(args: {
  projectId: string
  sessions: ProjectWorkbenchSession[]
}) {
  return args.sessions.map((session) => buildProjectWorkbenchSurfaceModel(args.projectId, session))
}

/**
 * @example
 * ```ts
 * const workbench = findProjectWorkbenchSurfaceModel({
 *   projectId: "project-a",
 *   sessions: [],
 *   workbenchId: "project-a--project--project-a",
 * })
 * ```
 */
function findProjectWorkbenchSurfaceModel(args: {
  projectId: string
  sessions: ProjectWorkbenchSession[]
  workbenchId: string
}) {
  return buildProjectWorkbenchSurfaceModels(args).find((workbench) => workbench.id === args.workbenchId) ?? null
}

export {
  buildProjectWorkbenchSurfaceModel,
  buildProjectWorkbenchSurfaceModels,
  findProjectWorkbenchSurfaceModel,
}

export type { ProjectWorkbenchSurfaceModel }
