## ADDED Requirements

### Requirement: Project storage доступен через adapter boundary

Система SHALL читать и писать project-scoped данные через storage adapter, а не через scattered localStorage/fs calls.

#### Scenario: Runtime читает project registry и active project
- **WHEN** lab или project runtime требует список проектов или active project
- **THEN** он обращается к project storage adapter
- **AND** не зависит от конкретного backend хранения

#### Scenario: Storage backend ещё локальный
- **WHEN** MVP использует локальное хранилище
- **THEN** adapter скрывает физический формат хранения
- **AND** future cloud/electron storage не требует переписывать project/workbench callers
