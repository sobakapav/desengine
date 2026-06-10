## Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать последовательность работы через `WorkflowInstance` и `WorkflowStepInstance`.

#### Scenario: Lab level является workflow step
- **WHEN** runtime строит workflow projection внутри active project
- **THEN** текущий уровень может быть представлен как `WorkflowStepInstance`
- **AND** `WorkflowStepInstance` содержит `projectId` active project
- **AND** входные и выходные данные шага описаны через artifacts
- **AND** состояние шага строится из текущего progress/check-result без миграции storage

#### Scenario: Workflow step хранит project-aware runtime bindings без жёсткого 1:1 с Workbench
- **WHEN** runtime строит workflow projection для открытой lab task
- **THEN** текущий `WorkflowStepInstance` может нести `runtimeBindings.workbenchInstanceIds`
- **AND** primary workbench, если он выбран, соответствует `WorkbenchInstance`, связанному с тем же `projectId`, `taskId` и workflow step
- **AND** workflow contract не требует, чтобы каждый шаг имел ровно один `WorkbenchInstance`

#### Scenario: Runtime surface может показать текущий workflow step через Workbench
- **WHEN** пользователь открывает текущую рабочую поверхность
- **THEN** surface может показать `workflow.currentStepId` и kind текущего шага
- **AND** surface связывает этот шаг с primary `WorkbenchInstance`
- **AND** пользовательская модель читает Workbench как materialization текущего workflow step
