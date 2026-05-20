import type { WorkbenchDefinition, WorkbenchTool } from "./model"

export type WorkbenchRegistry = {
  definitions: WorkbenchDefinition[]
  tools: WorkbenchTool[]
}

function assertUniqueIds(items: { id: string }[], label: string) {
  const ids = new Set<string>()

  for (const item of items) {
    if (!item.id.trim()) {
      throw new Error(`${label}: пустой id`)
    }

    if (ids.has(item.id)) {
      throw new Error(`${label}: повторяющийся id ${item.id}`)
    }

    ids.add(item.id)
  }
}

function validateDefinitionTools(definition: WorkbenchDefinition, toolsById: Map<string, WorkbenchTool>) {
  for (const toolId of definition.toolIds) {
    const tool = toolsById.get(toolId)

    if (!tool) {
      throw new Error(`WorkbenchDefinition ${definition.id} ссылается на неизвестный tool ${toolId}`)
    }

    const appliesToDefinition = tool.appliesTo.includes("*") ||
      tool.appliesTo.some((taskType) => definition.supportedTaskTypes.includes(taskType))

    if (!appliesToDefinition) {
      throw new Error(`WorkbenchTool ${tool.id} не применим к WorkbenchDefinition ${definition.id}`)
    }
  }
}

function validateDefinition(definition: WorkbenchDefinition, toolsById: Map<string, WorkbenchTool>) {
  if (!definition.title.trim()) {
    throw new Error(`WorkbenchDefinition ${definition.id}: пустой title`)
  }

  if (!definition.supportedTaskTypes.length) {
    throw new Error(`WorkbenchDefinition ${definition.id}: не указаны supportedTaskTypes`)
  }

  if (!definition.supportedWorkflowStepKinds.length) {
    throw new Error(`WorkbenchDefinition ${definition.id}: не указаны supportedWorkflowStepKinds`)
  }

  assertUniqueIds(definition.artifactSlots, `WorkbenchDefinition ${definition.id}.artifactSlots`)
  validateDefinitionTools(definition, toolsById)
}

function validateTool(tool: WorkbenchTool) {
  if (!tool.title.trim()) {
    throw new Error(`WorkbenchTool ${tool.id}: пустой title`)
  }

  if (!tool.appliesTo.length) {
    throw new Error(`WorkbenchTool ${tool.id}: не указаны appliesTo`)
  }

  if (!tool.stateVersion.trim()) {
    throw new Error(`WorkbenchTool ${tool.id}: пустой stateVersion`)
  }

  if (!tool.sourcing.primitive.trim() || !tool.sourcing.ownerBoundary.trim()) {
    throw new Error(`WorkbenchTool ${tool.id}: sourcing decision неполный`)
  }
}

export function createWorkbenchRegistry(registry: WorkbenchRegistry): WorkbenchRegistry {
  assertUniqueIds(registry.tools, "WorkbenchTool")
  assertUniqueIds(registry.definitions, "WorkbenchDefinition")

  const toolsById = new Map(registry.tools.map((tool) => [tool.id, tool] as const))

  registry.tools.forEach(validateTool)
  registry.definitions.forEach((definition) => validateDefinition(definition, toolsById))

  return {
    definitions: registry.definitions.map((definition) => ({ ...definition })),
    tools: registry.tools.map((tool) => ({ ...tool })),
  }
}

export function getWorkbenchDefinition(registry: WorkbenchRegistry, definitionId: string) {
  return registry.definitions.find((definition) => definition.id === definitionId) ?? null
}

export function getWorkbenchTool(registry: WorkbenchRegistry, toolId: string) {
  return registry.tools.find((tool) => tool.id === toolId) ?? null
}
