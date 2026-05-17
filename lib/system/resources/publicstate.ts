import resourceContent from "./content.json"
import { RESOURCE_IDS, RESOURCE_STATES, USER_ROLES } from "../const"
import type { Instruction, Resource, ResourceId, ResourceState, UserRole } from "../types"

type ResourceTemplateValues = Record<string, string | number | boolean | null | undefined>

type ResourceConditionContent = {
  state: ResourceState
  summary: string
  detail: string
}

type ResourceInstructionContent = {
  actor: UserRole
  text: string
}

type ResourceContent = {
  id: ResourceId
  label: string
  conditions: Record<string, ResourceConditionContent>
  instructions?: Record<string, ResourceInstructionContent>
}

type ResourceStatusInput = {
  id: ResourceId
  condition: string
  values?: ResourceTemplateValues
}

type ResolvedResourceStatus = {
  resource: Resource
  instruction: Instruction | null
}

const resourceDefinitions = resourceContent as unknown as ResourceContent[]
const resourceDefinitionsById = new Map<ResourceId, ResourceContent>(
  resourceDefinitions.map((definition) => [definition.id, definition]),
)

function formatTemplateValue(value: ResourceTemplateValues[string]): string {
  if (value === null || value === undefined) {
    return ""
  }

  return String(value)
}

function renderResourceTemplate(template: string, values: ResourceTemplateValues = {}) {
  return template.replace(/\{\{\s*([a-zA-Z0-9_.-]+)\s*\}\}/g, (_match, key: string) => {
    return formatTemplateValue(values[key])
  })
}

function getResourceDefinition(id: ResourceId) {
  const definition = resourceDefinitionsById.get(id)

  if (!definition) {
    throw new Error(`Не найдено описание системного ресурса: ${id}`)
  }

  return definition
}

function resolveResourceStatus({
  id,
  condition,
  values,
}: ResourceStatusInput): ResolvedResourceStatus {
  const definition = getResourceDefinition(id)
  const conditionContent = definition.conditions[condition]

  if (!conditionContent) {
    throw new Error(`Не найден condition "${condition}" для системного ресурса ${id}`)
  }

  const instructionContent = definition.instructions?.[condition] ?? null

  return {
    resource: {
      id,
      label: renderResourceTemplate(definition.label, values),
      state: conditionContent.state,
      summary: renderResourceTemplate(conditionContent.summary, values),
      detail: renderResourceTemplate(conditionContent.detail, values),
    },
    instruction: instructionContent
      ? {
          id,
          actor: instructionContent.actor,
          text: renderResourceTemplate(instructionContent.text, values),
        }
      : null,
  }
}

function getMissingResourceDefinitionIds() {
  return RESOURCE_IDS.filter((id) => !resourceDefinitionsById.has(id))
}

function getInvalidResourceDefinitions() {
  return resourceDefinitions.flatMap((definition) => {
    const errors: string[] = []

    if (!RESOURCE_IDS.includes(definition.id)) {
      errors.push(`unknown resource id: ${definition.id}`)
    }

    for (const [condition, content] of Object.entries(definition.conditions)) {
      if (!RESOURCE_STATES.includes(content.state)) {
        errors.push(`${definition.id}.${condition}: unknown state ${content.state}`)
      }
    }

    for (const [condition, instruction] of Object.entries(definition.instructions ?? {})) {
      if (!definition.conditions[condition]) {
        errors.push(`${definition.id}.${condition}: instruction without condition`)
      }

      if (!USER_ROLES.includes(instruction.actor)) {
        errors.push(`${definition.id}.${condition}: unknown actor ${instruction.actor}`)
      }
    }

    return errors
  })
}

export type {
  ResourceStatusInput,
  ResourceTemplateValues,
  ResolvedResourceStatus,
}

export {
  getInvalidResourceDefinitions,
  getMissingResourceDefinitionIds,
  renderResourceTemplate,
  resolveResourceStatus,
}
