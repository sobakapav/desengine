## Proposed Contracts

```ts
type WorkbenchDefinition = {
  id: string
  title: string
  supportedTaskTypes: string[]
  supportedWorkflowStepKinds: string[]
  toolIds: string[]
}

type WorkbenchInstance = {
  id: string
  definitionId: string
  projectId: string
  taskId: string
  workflowStepId: string
  artifactBindings: Record<string, string>
  state: unknown
}

type WorkbenchTool = {
  id: string
  title: string
  appliesTo: string[]
  stateVersion: string
}
```

## Migration Path

- Step 1: introduce contracts and registry as source-contract/read-only layer.
- Step 2: wrap current Lab Workbench as `lab-component-workbench` definition.
- Step 3: move image inspector and layout tools into registry in later changes.

## Testing Strategy

- Unit: registry validates unique ids and supported bindings.
- Unit: workbench instance serializes/deserializes state.
- Source-contract: current lab Workbench uses registry/definition boundary.
- Browser smoke: existing lab opens and edits one file if UI changed.
