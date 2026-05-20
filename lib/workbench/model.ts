import type { ArtifactKind } from "@/lib/task/model"

export type JsonPrimitive = string | number | boolean | null
export type JsonObject = { [key: string]: JsonValue }
export type JsonArray = JsonValue[]
export type JsonValue = JsonPrimitive | JsonObject | JsonArray

export type WorkbenchSourcingStrategy = "reuse" | "adapt" | "build"

export type WorkbenchSourcingDecision = {
  strategy: WorkbenchSourcingStrategy
  primitive: string
  ownerBoundary: string
  adapterPolicy: string
  testLevel: "static" | "unit" | "component" | "e2e-smoke" | "live"
}

export type WorkbenchStateEnvelope = {
  version: string
  value: JsonObject
}

export type WorkbenchToolStateEnvelope = {
  toolId: string
  version: string
  value: JsonObject
}

export type WorkbenchTool = {
  id: string
  title: string
  appliesTo: string[]
  stateVersion: string
  sourcing: WorkbenchSourcingDecision
}

export type WorkbenchArtifactSlot = {
  id: string
  title: string
  acceptedArtifactKinds: ArtifactKind[]
  multiple?: boolean
}

export type WorkbenchDefinition = {
  id: string
  title: string
  profileId: string
  supportedTaskTypes: string[]
  supportedWorkflowStepKinds: string[]
  toolIds: string[]
  artifactSlots: WorkbenchArtifactSlot[]
  stateVersion: string
}

export type WorkbenchInstance = {
  id: string
  definitionId: string
  projectId: string
  taskId: string
  workflowStepId: string
  artifactBindings: Record<string, string>
  state: WorkbenchStateEnvelope
  toolStates: Record<string, WorkbenchToolStateEnvelope>
}
