import {
  createProjectSession,
  normalizeProjectSession,
  normalizeProjectWorkspaceActivity,
  type ProjectSession,
  type ProjectWorkspaceActivity,
} from "@/lib/project/workspace-session"

type ProjectWorkspaceStorage = {
  appendActivity(projectId: string, activity: ProjectWorkspaceActivity): Promise<void>
  getSession(projectId: string): Promise<ProjectSession>
  listActivities(projectId: string): Promise<ProjectWorkspaceActivity[]>
  saveSession(session: ProjectSession): Promise<void>
}

function createMemoryProjectWorkspaceStorage(
  initialSessions: ProjectSession[] = [],
  initialActivities: ProjectWorkspaceActivity[] = [],
): ProjectWorkspaceStorage {
  const sessions = new Map(initialSessions.map((session) => [session.projectId, normalizeProjectSession(session, session.projectId)]))
  const activities = new Map<string, ProjectWorkspaceActivity[]>()

  for (const activity of initialActivities) {
    const current = activities.get(activity.projectId) ?? []
    activities.set(activity.projectId, [activity, ...current].sort((left, right) => right.createdAt.localeCompare(left.createdAt)))
  }

  return {
    async getSession(projectId: string) {
      return sessions.get(projectId) ?? createProjectSession(projectId)
    },
    async saveSession(session: ProjectSession) {
      sessions.set(session.projectId, normalizeProjectSession(session, session.projectId))
    },
    async listActivities(projectId: string) {
      return [...(activities.get(projectId) ?? [])]
    },
    async appendActivity(projectId: string, activity: ProjectWorkspaceActivity) {
      const current = activities.get(projectId) ?? []
      activities.set(projectId, [activity, ...current].sort((left, right) => right.createdAt.localeCompare(left.createdAt)))
    },
  }
}

export {
  createMemoryProjectWorkspaceStorage,
}

export type { ProjectWorkspaceStorage }
