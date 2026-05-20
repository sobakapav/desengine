## Proposed Shape

```ts
type PromptContext = {
  project: ProjectWorkspace
  task: TaskInstance
  workflowStep: WorkflowStepInstance
  artifacts: Artifact[]
  workbench?: WorkbenchInstance
  userText?: string
  constraints: string[]
  providerCapabilities: string[]
}
```

## Rollout

1. Build read-only context from existing task/lab data.
2. Move repeated file/image/level context formatting behind context builder helpers.
3. Switch start/iterate/check services to consume PromptContext.
4. Keep generated prompt text behavior stable; tests compare required sections, not exact prose unless contract requires it.

## Testing Strategy

- Unit: builder includes project/task/workflow/artifacts.
- Unit: start/iterate/check preserve required prompt sections.
- Source-contract: task-hints/prompt-builder must depend on PromptContext later.
