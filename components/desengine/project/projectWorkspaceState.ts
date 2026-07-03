"use client"

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
  createBrowserProjectWorkspaceStorage,
} from "@/lib/project/workspace-storage"
import {
  normalizeProjectSession,
  pickLatestActivityTimestamp,
  resolveProjectSessionStatus,
  type ProjectSession,
  type ProjectWorkspaceActivity,
} from "@/lib/project/workspace-session"
import { createBrowserProjectComponentStorage } from "@/lib/project/component-storage"

type ProjectWorkspaceState = {
  status: "loading" | "ready" | "error"
  components: ProjectComponent[]
  session: ProjectSession | null
  activities: ProjectWorkspaceActivity[]
  workbenches: ProjectWorkbenchSession[]
  workflowReadout: ProjectWorkflowReadoutSnapshot
  historyDiagnostics: ProjectHistoryDiagnosticsSnapshot
}

type ProjectWorkspaceSnapshot = Omit<ProjectWorkspaceState, "status">

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

async function readProjectWorkspaceSnapshot(project: ProjectWorkspace) {
  const componentStorage = createBrowserProjectComponentStorage(window.localStorage)
  const workspaceStorage = createBrowserProjectWorkspaceStorage(window.localStorage)

  const [components, rawSession, activities] = await Promise.all([
    componentStorage.listComponents(project.id),
    workspaceStorage.getSession(project.id),
    workspaceStorage.listActivities(project.id),
  ])

  const completedComponentCount = components.filter((component) => component.status === "completed").length
  const inProgressComponentCount = components.filter((component) => component.status === "in_progress").length
  const syncedSession = normalizeProjectSession({
    ...rawSession,
    lastActivityAt: pickLatestActivityTimestamp(activities, components),
    status: resolveProjectSessionStatus({
      componentCount: components.length,
      completedComponentCount,
      inProgressComponentCount,
      storedStatus: rawSession.status,
    }),
  }, project.id)

  if (
    syncedSession.status !== rawSession.status
    || syncedSession.lastActivityAt !== rawSession.lastActivityAt
  ) {
    await workspaceStorage.saveSession({
      ...rawSession,
      ...syncedSession,
    })
  }

  return buildProjectWorkspaceSnapshot({
    activities,
    components,
    project,
    session: syncedSession,
  })
}

export {
  buildEmptyProjectWorkspaceState,
  buildProjectWorkspaceErrorState,
  buildProjectWorkspaceReadyState,
  readProjectWorkspaceSnapshot,
}

export type {
  ProjectWorkspaceSnapshot,
  ProjectWorkspaceState,
}
