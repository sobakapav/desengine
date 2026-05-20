## Proposed Model

```ts
type TaskInstance = {
  id: string
  projectId: string
  taskType: string
  title: string
  workflowInstanceId: string
  artifactIds: string[]
  status: "new" | "in_progress" | "completed" | "blocked"
}

type WorkflowInstance = {
  id: string
  projectId: string
  taskId: string
  definitionId: string
  currentStepId: string
  stepInstances: WorkflowStepInstance[]
}

type WorkflowStepInstance = {
  id: string
  kind: string
  status: "not_started" | "in_progress" | "completed" | "failed"
  inputArtifactIds: string[]
  outputArtifactIds: string[]
  workbenchInstanceId?: string
}

type Artifact = {
  id: string
  projectId: string
  taskId?: string
  kind: string
  uri?: string
  data?: unknown
  createdAt: string
}
```

## Mapping Current Lab

- Current task id -> `TaskInstance.id`.
- Current level -> `WorkflowStepInstance.kind = "level-lab"`.
- `Component.tsx`, `styles.ts`, `mock.ts`, `props.ts` -> code artifacts.
- Prompt history entries -> prompt artifacts or event-linked artifacts.
- Check result -> evaluation artifact.

## Testing Strategy

- Contract tests for shape normalization and serialization.
- Mapping tests from current `TaskData`/progress to future task/workflow projection.
- Source-contract checks that downstream Workbench/Prompt changes use shared types.
