"use client"

import {
  buildProjectWorkflowReadoutSnapshot,
  type ProjectWorkflowReadoutSnapshot
} from "@/lib/project/workflow-readout"
import { buildProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"
import type { ProjectWorkspaceSnapshot } from "@/lib/project/workspace-snapshot"
import type { ProjectComponent } from "@/lib/project/component-runtime"
import type { ProjectSession, ProjectWorkspaceActivity } from "@/lib/project/workspace-session"
import type { ProjectWorkbenchSession } from "@/lib/project/workbench"
import type { ProjectHistoryDiagnosticsSnapshot } from "@/lib/project/history-diagnostics"

type ProjectWorkspaceState = {
  status: "loading" | "ready" | "error"
  components: ProjectComponent[]
  session: ProjectSession | null
  activities: ProjectWorkspaceActivity[]
  workbenches: ProjectWorkbenchSession[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
}

function buildEmptyProjectWorkspaceState(projectId: string): ProjectWorkspaceState {
  return {
    status: "loading",
    components: [],
    session: null,
    activities: [],
    workbenches: [],
    workflowReadout: buildProjectWorkflowReadoutSnapshot({
      projectId,
      activities: [],
      components: [],
      session: null,
    }),
    historyDiagnostics: buildProjectHistoryDiagnosticsSnapshot(projectId, [], []),
  }
}

function buildProjectWorkspaceReadyState(snapshot: ProjectWorkspaceSnapshot): ProjectWorkspaceState {
  return {
    status: "ready",
    ...snapshot,
  }
}

function buildProjectWorkspaceErrorState(projectId: string): ProjectWorkspaceState {
  return {
    ...buildEmptyProjectWorkspaceState(projectId),
    status: "error",
  }
}

export {
  buildEmptyProjectWorkspaceState,
  buildProjectWorkspaceErrorState,
  buildProjectWorkspaceReadyState,
}

export type {
  ProjectWorkspaceSnapshot,
  ProjectWorkspaceState,
}
