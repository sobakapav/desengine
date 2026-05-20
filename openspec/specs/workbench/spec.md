## Requirements

### Requirement: Workbench имеет definition и instance

Система SHALL описывать рабочий стол через `WorkbenchDefinition` и `WorkbenchInstance`.

#### Scenario: Lab workbench регистрируется как definition
- **WHEN** runtime открывает текущий lab workbench
- **THEN** он может определить `WorkbenchDefinition`
- **AND** definition содержит profile `level-lab`, поддерживаемый task type, workflow step kind и список tools
- **AND** текущий lab workbench использует definition `lab-component-workbench`

#### Scenario: WorkbenchInstance связан с project/task/workflow step
- **WHEN** runtime строит projection текущей lab task
- **THEN** он создаёт `WorkbenchInstance`
- **AND** instance содержит `projectId`, `taskId`, `workflowStepId` и `definitionId`
- **AND** workflow step ссылается на этот instance через `workbenchInstanceId`

#### Scenario: Workbench state сериализуется
- **WHEN** runtime сохраняет или передаёт состояние Workbench
- **THEN** state представлен JSON-сериализуемым envelope с `version` и `value`
- **AND** несериализуемые значения отклоняются на boundary
