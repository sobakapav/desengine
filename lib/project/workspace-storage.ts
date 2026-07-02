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

const PROJECT_SESSION_STORAGE_KEY_PREFIX = "desengine:project-session:"
const PROJECT_ACTIVITY_STORAGE_KEY_PREFIX = "desengine:project-activity:"

function getProjectSessionStorageKey(projectId: string) {
  return `${PROJECT_SESSION_STORAGE_KEY_PREFIX}${projectId}`
}

function getProjectActivityStorageKey(projectId: string) {
  return `${PROJECT_ACTIVITY_STORAGE_KEY_PREFIX}${projectId}`
}

function readStorageJson(storage: Storage, key: string): unknown {
  const raw = storage.getItem(key)
  if (!raw) return null

  try {
    return JSON.parse(raw) as unknown
  } catch {
    return null
  }
}

function createBrowserProjectWorkspaceStorage(storage: Storage): ProjectWorkspaceStorage {
  return {
    async getSession(projectId: string) {
      return normalizeProjectSession(
        readStorageJson(storage, getProjectSessionStorageKey(projectId)) as ProjectSession | null,
        projectId,
      )
    },
    async saveSession(session: ProjectSession) {
      storage.setItem(
        getProjectSessionStorageKey(session.projectId),
        JSON.stringify(normalizeProjectSession(session, session.projectId)),
      )
    },
    async listActivities(projectId: string) {
      const rawActivities = readStorageJson(storage, getProjectActivityStorageKey(projectId))
      if (!Array.isArray(rawActivities)) {
        return []
      }

      return rawActivities
        .map((activity) => normalizeProjectWorkspaceActivity(activity as ProjectWorkspaceActivity, projectId))
        .filter((activity): activity is ProjectWorkspaceActivity => activity !== null)
        .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
    },
    async appendActivity(projectId: string, activity: ProjectWorkspaceActivity) {
      const nextActivities = [
        activity,
        ...(await this.listActivities(projectId)),
      ]
      storage.setItem(getProjectActivityStorageKey(projectId), JSON.stringify(nextActivities))
    },
  }
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
  createBrowserProjectWorkspaceStorage,
  createMemoryProjectWorkspaceStorage,
  getProjectActivityStorageKey,
  getProjectSessionStorageKey,
}

export type { ProjectWorkspaceStorage }
