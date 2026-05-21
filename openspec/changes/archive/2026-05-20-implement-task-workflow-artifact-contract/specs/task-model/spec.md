## ADDED Requirements

### Requirement: TaskInstance описывает работу пользователя внутри проекта

Система SHALL представлять пользовательскую работу как project-scoped TaskInstance.

#### Scenario: Текущая lab task проецируется в TaskInstance
- **WHEN** runtime читает существующую задачу лаборатории
- **THEN** он может построить TaskInstance projection
- **AND** projection содержит `projectId`, `taskType`, `workflowInstanceId` и статус
