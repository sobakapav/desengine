import type { ProjectComponent } from "@/lib/project/component-runtime"

type ProjectWorkflowSessionCatalogItem = {
  sessionId: string
  sessionTitle: string
}

const PROJECT_WORKFLOW_SESSION_ID = "project-workflow"

function resolveProjectWorkflowSessionId(
  workflowKind: ProjectComponent["workflowKind"],
  workflowSessionCatalog: ProjectWorkflowSessionCatalogItem[],
) {
  const templateSessionId = workflowKind === "image-to-component-workflow"
    ? PROJECT_WORKFLOW_SESSION_ID
    : null

  if (!templateSessionId) {
    return null
  }

  const matchedSession = workflowSessionCatalog.find((session) => session.sessionId === templateSessionId)
  return matchedSession ? PROJECT_WORKFLOW_SESSION_ID : null
}

/**
 * @example
 * ```ts
 * const sessionId = resolveProjectComponentWorkflowSessionId({
 *   component,
 *   workflowSessionCatalog: [{ sessionId: "project-workflow", sessionTitle: "Project workflow" }],
 * })
 * ```
 */
function resolveProjectComponentWorkflowSessionId(args: {
  component: ProjectComponent
  projectTitle?: string | null
  workflowSessionCatalog: ProjectWorkflowSessionCatalogItem[]
}) {
  return resolveProjectWorkflowSessionId(args.component.workflowKind, args.workflowSessionCatalog)
}

/**
 * @example
 * ```ts
 * const label = resolveProjectWorkflowSessionLabel("project-workflow", [
 *   { sessionId: "project-workflow", sessionTitle: "Project workflow" },
 * ])
 * ```
 */
function resolveProjectWorkflowSessionLabel(
  sessionId: string | null,
  workflowSessionCatalog: ProjectWorkflowSessionCatalogItem[],
) {
  if (!sessionId) {
    return "ещё не назначен"
  }

  const session = workflowSessionCatalog.find((entry) => entry.sessionId === sessionId)
  return session ? `${session.sessionTitle} (${session.sessionId})` : sessionId
}

export {
  resolveProjectComponentWorkflowSessionId,
  resolveProjectWorkflowSessionLabel,
}

export type {
  ProjectWorkflowSessionCatalogItem,
}
