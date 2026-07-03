type WorkflowSubjectKind =
  | "project"
  | "component"
  | "component-set"
  | "screen"
  | "screen-set"
  | "data-set"
  | "domain-model"
  | "storybook-layer"
  | "prototype"
  | "reference-pack"
  | "design-system-migration"

type WorkflowOperationFamily =
  | "component-creation"
  | "component-composition"
  | "screen-composition"
  | "ui-kit-migration"
  | "data-generation"

type WorkflowEntrySurface =
  | "project-page"
  | "component-card"
  | "component-set-panel"
  | "screen-map"
  | "data-layer"
  | "project-settings"

type WorkflowInputKind =
  | "image"
  | "figma-json"
  | "component-selection"
  | "screen-structure"
  | "ui-kit-target"
  | "domain-schema"
  | "mock-data-constraints"
  | "loading-state-profile"

type WorkflowArtifactKind =
  | "react-component"
  | "component-composition-plan"
  | "screen-layout"
  | "migration-plan"
  | "mock-data-set"
  | "loading-state-demo"
  | "state-coverage-note"

type WorkflowInputRequirementMode = "all-of" | "one-of" | "optional"

type WorkflowInputRequirement = {
  mode: WorkflowInputRequirementMode
  inputs: WorkflowInputKind[]
  summary: string
}

type WorkflowDefinitionStep = {
  id: string
  title: string
  summary: string
  inputRequirements?: WorkflowInputRequirement[]
  requiredArtifacts?: WorkflowArtifactKind[]
  resultArtifacts?: WorkflowArtifactKind[]
}

type WorkflowDefinition = {
  id: string
  title: string
  summary: string
  operationFamily: WorkflowOperationFamily
  subjectKinds: WorkflowSubjectKind[]
  inputRequirements: WorkflowInputRequirement[]
  producedArtifacts: WorkflowArtifactKind[]
  entrySurfaces: WorkflowEntrySurface[]
  followUpWorkflowIds: string[]
  stepDefinitions: WorkflowDefinitionStep[]
}

export type {
  WorkflowArtifactKind,
  WorkflowDefinition,
  WorkflowDefinitionStep,
  WorkflowEntrySurface,
  WorkflowInputKind,
  WorkflowInputRequirement,
  WorkflowInputRequirementMode,
  WorkflowOperationFamily,
  WorkflowSubjectKind,
}
