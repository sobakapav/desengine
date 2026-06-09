export type RuntimeDiagnosticsStatus = "ok" | "error" | "noop" | "degraded"

export type RuntimeDiagnosticsRecord = {
  scope: "task" | "level-labs"
  path: string
  stage: string
  status: RuntimeDiagnosticsStatus
  durationMs: number
  timestamp: string
  taskId?: string
  previewSessionId?: string
  load?: Record<string, number | string | boolean | null | undefined>
  size?: Record<string, number | string | boolean | null | undefined>
  degradation?: {
    reason: string
    details?: Record<string, unknown>
  }
}

type HttpLikeResult = {
  body: unknown
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function hasHttpLikeBody(value: unknown): value is HttpLikeResult & Record<string, unknown> {
  return isPlainObject(value) && "body" in value
}

export function createRuntimeDiagnosticsRecord(
  record: Omit<RuntimeDiagnosticsRecord, "timestamp">,
): RuntimeDiagnosticsRecord {
  return {
    ...record,
    timestamp: new Date().toISOString(),
  }
}

export function emitRuntimeDiagnostics(record: RuntimeDiagnosticsRecord) {
  console.log("[desengine][runtime-diagnostics]", record)
}

export function emitRuntimeDiagnosticsBatch(records: RuntimeDiagnosticsRecord[]) {
  for (const record of records) {
    emitRuntimeDiagnostics(record)
  }
}

/**
 * @example
 * ```ts
 * const nextResult = attachRuntimeDiagnostics(result, [record])
 * ```
 */
export function attachRuntimeDiagnostics<T>(
  result: T,
  records: RuntimeDiagnosticsRecord[],
): T {
  if (!hasHttpLikeBody(result)) {
    return result
  }

  if (!isPlainObject(result.body)) {
    return result
  }

  const responseBody = result.body
  const existing = Array.isArray(responseBody.runtimeDiagnostics)
    ? responseBody.runtimeDiagnostics as RuntimeDiagnosticsRecord[]
    : []

  result.body = {
    ...responseBody,
    runtimeDiagnostics: [...existing, ...records],
  }

  return result
}

export function sumTextLengths(values: Array<string | null | undefined>) {
  return values.reduce((total, value) => total + (typeof value === "string" ? value.length : 0), 0)
}
