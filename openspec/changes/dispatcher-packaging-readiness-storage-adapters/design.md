## Readiness Checklist

Packaging implementation может стартовать только если:

- Project Workspace хранится через adapter.
- Task/Workflow/Artifact data имеют adapter или projection boundary.
- EventEnvelope storage имеет export/delete policy.
- Secrets/credentials не лежат в project artifacts/events.
- Есть migration story для local storage.
- Есть smoke strategy для local/electron/cloud targets без live provider credentials.

## Adapter Categories

- `LocalStorageAdapter`: текущий local-first MVP.
- `DesktopStorageAdapter`: будущий Electron profile.
- `HostedStorageAdapter`: будущий cloud profile.

В этом change допускается только contract/readiness layer, не backend switch.

## Testing Strategy

- Static/contract tests for adapter interface.
- Unit tests for export/delete fixture behavior.
- Traceability check for deferred packaging implementation.
