## MODIFIED Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать последовательность работы через `WorkflowInstance` и `WorkflowStepInstance`.

#### Scenario: Workflow step ссылается на WorkbenchInstance
- **WHEN** runtime строит workflow projection для открытой lab task
- **THEN** текущий `WorkflowStepInstance` содержит `workbenchInstanceId`
- **AND** этот id соответствует `WorkbenchInstance`, связанному с тем же `projectId`, `taskId` и workflow step
