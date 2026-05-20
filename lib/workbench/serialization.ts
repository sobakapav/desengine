import type {
  JsonArray,
  JsonObject,
  JsonValue,
  WorkbenchInstance,
  WorkbenchStateEnvelope,
  WorkbenchToolStateEnvelope,
} from "./model"

type RawWorkbenchInstance = Omit<WorkbenchInstance, "state" | "toolStates"> & {
  state?: unknown
  toolStates?: Record<string, unknown>
}

function assertJsonValue(value: unknown, path = "value"): asserts value is JsonValue {
  if (value === null) return

  const valueType = typeof value
  if (valueType === "string" || valueType === "number" || valueType === "boolean") {
    if (valueType === "number" && !Number.isFinite(value)) {
      throw new Error(`${path} должен быть сериализуемым JSON-значением`)
    }
    return
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => assertJsonValue(item, `${path}[${index}]`))
    return
  }

  if (valueType === "object") {
    for (const [key, nestedValue] of Object.entries(value as Record<string, unknown>)) {
      assertJsonValue(nestedValue, `${path}.${key}`)
    }
    return
  }

  throw new Error(`${path} должен быть сериализуемым JSON-значением`)
}

function toJsonObject(value: unknown, path: string): JsonObject {
  assertJsonValue(value, path)

  if (!value || Array.isArray(value) || typeof value !== "object") {
    throw new Error(`${path} должен быть JSON-объектом`)
  }

  return value
}

export function serializeWorkbenchState(state: WorkbenchStateEnvelope): WorkbenchStateEnvelope {
  return {
    version: state.version,
    value: toJsonObject(state.value, "workbench.state.value"),
  }
}

export function serializeWorkbenchToolState(state: WorkbenchToolStateEnvelope): WorkbenchToolStateEnvelope {
  return {
    toolId: state.toolId,
    version: state.version,
    value: toJsonObject(state.value, `workbench.toolStates.${state.toolId}.value`),
  }
}

function normalizeToolStates(rawToolStates: Record<string, unknown> | undefined) {
  const toolStates: Record<string, WorkbenchToolStateEnvelope> = {}

  for (const [toolId, rawState] of Object.entries(rawToolStates ?? {})) {
    const state = rawState as Partial<WorkbenchToolStateEnvelope>
    toolStates[toolId] = serializeWorkbenchToolState({
      toolId: state.toolId ?? toolId,
      version: state.version ?? "1",
      value: (state.value ?? {}) as JsonObject,
    })
  }

  return toolStates
}

export function serializeWorkbenchInstance(instance: RawWorkbenchInstance): WorkbenchInstance {
  const state = instance.state as Partial<WorkbenchStateEnvelope> | undefined

  return {
    id: instance.id,
    definitionId: instance.definitionId,
    projectId: instance.projectId,
    taskId: instance.taskId,
    workflowStepId: instance.workflowStepId,
    artifactBindings: { ...instance.artifactBindings },
    state: serializeWorkbenchState({
      version: state?.version ?? "1",
      value: (state?.value ?? {}) as JsonObject,
    }),
    toolStates: normalizeToolStates(instance.toolStates),
  }
}

export function deserializeWorkbenchInstance(serialized: string): WorkbenchInstance {
  return serializeWorkbenchInstance(JSON.parse(serialized) as RawWorkbenchInstance)
}

export function stringifyWorkbenchInstance(instance: WorkbenchInstance) {
  return JSON.stringify(serializeWorkbenchInstance(instance))
}

export function isJsonArray(value: JsonValue): value is JsonArray {
  return Array.isArray(value)
}
