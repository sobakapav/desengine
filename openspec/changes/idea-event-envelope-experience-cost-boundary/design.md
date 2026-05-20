## Proposed Envelope

```ts
type EventEnvelope<TPayload> = {
  eventId: string
  kind: string
  projectId: string
  taskId?: string
  workflowStepId?: string
  workbenchInstanceId?: string
  createdAt: string
  privacyClass: "local" | "sensitive" | "secret-adjacent"
  redactionState: "raw" | "redacted" | "metadata-only"
  payload: TPayload
}
```

## Payload Profiles

- `experience.prompt-used`
- `experience.patch-applied`
- `action.hotkey-used`
- `action.tool-opened`
- `cost.llm-usage`
- `cost.manual-time`

## Privacy Guardrails

- Local-first storage for MVP.
- Metadata-only by default for cost where content is not needed.
- Explicit redaction for prompt/code payloads.
- Export/delete must work by project scope.

## Testing Strategy

- Unit: envelope validation and scope requirements.
- Unit: redaction strips sensitive payload fields.
- Contract: cost/experience/action payloads share envelope fields.
