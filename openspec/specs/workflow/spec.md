## Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать последовательность работы через `WorkflowInstance` и `WorkflowStepInstance`.

#### Scenario: Lab level является workflow step
- **WHEN** пользователь работает с уровнем lab
- **THEN** текущий уровень может быть представлен как `WorkflowStepInstance`
- **AND** входные и выходные данные шага описаны через artifacts
- **AND** состояние шага строится из текущего progress/check-result без миграции storage

#### Scenario: Workflow step ссылается на WorkbenchInstance
- **WHEN** runtime строит workflow projection для открытой lab task
- **THEN** текущий `WorkflowStepInstance` содержит `workbenchInstanceId`
- **AND** этот id соответствует `WorkbenchInstance`, связанному с тем же `projectId`, `taskId` и workflow step
