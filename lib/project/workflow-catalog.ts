import { componentWorkflows } from "./workflow-catalog/component-workflows"
import { dataWorkflows } from "./workflow-catalog/data-workflows"
import { projectWorkflows } from "./workflow-catalog/project-workflows"
import { screenWorkflows } from "./workflow-catalog/screen-workflows"
import type { WorkflowDefinition, WorkflowSubjectKind } from "./workflow-catalog/types"

const workflowCatalogSeed = [
  ...componentWorkflows,
  ...screenWorkflows,
  ...projectWorkflows,
  ...dataWorkflows,
] satisfies WorkflowDefinition[]

/**
 * @example
 * ```ts
 * const definitions = listWorkflowCatalogSeed()
 * ```
 */
function listWorkflowCatalogSeed() {
  return workflowCatalogSeed
}

/**
 * @example
 * ```ts
 * const definition = getWorkflowDefinition("screen-composition")
 * ```
 */
function getWorkflowDefinition(definitionId: string) {
  return workflowCatalogSeed.find((definition) => definition.id === definitionId) ?? null
}

/**
 * @example
 * ```ts
 * const componentFlows = listWorkflowDefinitionsForSubjectKind("component")
 * ```
 */
function listWorkflowDefinitionsForSubjectKind(subjectKind: WorkflowSubjectKind) {
  return workflowCatalogSeed.filter((definition) => (
    definition.subjectKinds.some((definitionSubjectKind) => definitionSubjectKind === subjectKind)
  ))
}

export {
  getWorkflowDefinition,
  listWorkflowCatalogSeed,
  listWorkflowDefinitionsForSubjectKind,
}

export type {
  WorkflowArtifactKind,
  WorkflowDefinition,
  WorkflowDefinitionStep,
  WorkflowEntrySurface,
  WorkflowInputRequirement,
  WorkflowInputRequirementMode,
  WorkflowInputKind,
  WorkflowOperationFamily,
  WorkflowSubjectKind,
} from "./workflow-catalog/types"
