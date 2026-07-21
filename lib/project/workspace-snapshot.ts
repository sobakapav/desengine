import type { ProjectComponent } from "@/lib/project/component-runtime"
import {
  buildProjectHistoryDiagnosticsSnapshot,
  type ProjectHistoryDiagnosticsSnapshot,
} from "@/lib/project/history-diagnostics"
import type { ProjectWorkspace } from "@/lib/project/runtime"
import { buildProjectWorkbenchSessions, type ProjectWorkbenchSession } from "@/lib/project/workbench"
import {
  buildProjectWorkflowReadoutSnapshot,
  type ProjectWorkflowReadoutSnapshot,
} from "@/lib/project/workflow-readout"
import {
  normalizeProjectSession,
  pickLatestActivityTimestamp,
  resolveProjectSessionStatus,
  type ProjectSession,
  type ProjectWorkspaceActivity,
} from "@/lib/project/workspace-session"

type ProjectWorkspaceSnapshot = {
  components: ProjectComponent[]
  session: ProjectSession | null
  activities: ProjectWorkspaceActivity[]
  workbenches: ProjectWorkbenchSession[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
}

function buildProjectWorkspaceSnapshot(args: {
  activities: ProjectWorkspaceActivity[]
  components: ProjectComponent[]
  project: ProjectWorkspace
  session: ProjectSession | null
}): ProjectWorkspaceSnapshot {
  const workflowReadout = buildProjectWorkflowReadoutSnapshot({
    projectId: args.project.id,
    activities: args.activities,
    components: args.components,
    session: args.session,
  })

  return {
    components: args.components,
    session: args.session,
    activities: args.activities,
    workbenches: buildProjectWorkbenchSessions({
      components: args.components,
      project: args.project,
      session: args.session,
      workflowReadout,
    }),
    workflowReadout,
    historyDiagnostics: buildProjectHistoryDiagnosticsSnapshot(
      args.project.id,
      args.activities,
      args.components,
    ),
  }
}

function syncProjectSession(args: {
  activities: ProjectWorkspaceActivity[]
  components: ProjectComponent[]
  project: ProjectWorkspace
  session: ProjectSession
}) {
  const completedComponentCount = args.components.filter((component) => component.status === "completed").length
  const inProgressComponentCount = args.components.filter((component) => component.status === "in_progress").length

  return normalizeProjectSession({
    ...args.session,
    lastActivityAt: pickLatestActivityTimestamp(args.activities, args.components),
    status: resolveProjectSessionStatus({
      componentCount: args.components.length,
      completedComponentCount,
      inProgressComponentCount,
      storedStatus: args.session.status,
    }),
  }, args.project.id)
}

export {
  buildProjectWorkspaceSnapshot,
  syncProjectSession,
}

export type { ProjectWorkspaceSnapshot }
