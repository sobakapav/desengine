## Requirements

### Requirement: TaskInstance описывает работу пользователя внутри проекта

Система SHALL представлять пользовательскую работу как project-scoped `TaskInstance`, связанный с workflow и artifacts.

#### Scenario: Текущая lab task проецируется в TaskInstance
- **WHEN** runtime читает существующую задачу лаборатории
- **THEN** он может построить read-only `TaskInstance` projection
- **AND** projection содержит `projectId`, `taskType`, `workflowInstanceId`, `artifactIds` и статус
- **AND** `projectId` передаётся из `ProjectWorkspace` или явного project scope, а legacy fallback включается только как compatibility path
