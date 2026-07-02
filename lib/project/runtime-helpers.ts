const DEFAULT_PROJECT_TIMESTAMP = "1970-01-01T00:00:00.000Z"

function normalizeProjectTimestamp(rawTimestamp: string | null | undefined, fallback = DEFAULT_PROJECT_TIMESTAMP) {
  if (typeof rawTimestamp !== "string" || !rawTimestamp.trim()) return fallback
  const date = new Date(rawTimestamp)
  if (Number.isNaN(date.getTime())) return fallback
  return date.toISOString()
}

function normalizeOptionalProjectTimestamp(rawTimestamp: string | null | undefined) {
  if (typeof rawTimestamp !== "string" || !rawTimestamp.trim()) return null

  return normalizeProjectTimestamp(rawTimestamp)
}

function createProjectTimestamp() {
  return new Date().toISOString()
}

function createProjectWorkspaceId() {
  return `project-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

export {
  createProjectTimestamp,
  createProjectWorkspaceId,
  normalizeOptionalProjectTimestamp,
  normalizeProjectTimestamp,
}
