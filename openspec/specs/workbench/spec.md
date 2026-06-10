## Requirements

### Requirement: Workbench имеет definition, instance и surface-проявление

Система SHALL описывать рабочую поверхность через `WorkbenchDefinition` и `WorkbenchInstance`.

#### Scenario: Lab workbench регистрируется как definition
- **WHEN** runtime открывает текущий lab workbench
- **THEN** он может определить `WorkbenchDefinition`
- **AND** definition содержит profile `level-lab`, поддерживаемый task type, workflow step kind и список tools
- **AND** текущий lab workbench использует definition `lab-component-workbench`

#### Scenario: WorkbenchInstance связан с project/task/workflow step
- **WHEN** runtime строит projection текущей lab task
- **THEN** он создаёт `WorkbenchInstance`
- **AND** instance содержит `projectId`, `taskId`, `workflowStepId` и `definitionId`
- **AND** workbench input contract читает `ProjectWorkspace.settings` как часть project boundary текущего active project
- **AND** workflow step может ссылаться на этот instance через `runtimeBindings.workbenchInstanceIds`
- **AND** workbench contract не требует жёсткого `1:1` между workflow step и `WorkbenchInstance`

#### Scenario: Runtime surface показывает definition и рабочую связку
- **WHEN** пользователь открывает текущую рабочую поверхность
- **THEN** surface может показать `WorkbenchDefinition.title`, `profileId` и `WorkbenchInstance.id`
- **AND** surface явно читает связку `project -> task -> workflow step -> workbench`
- **AND** проявление Workbench не остаётся только foundation-структурой без user-facing следа

#### Scenario: Workbench state сериализуется
- **WHEN** runtime сохраняет или передаёт состояние Workbench
- **THEN** state представлен JSON-сериализуемым envelope с `version` и `value`
- **AND** несериализуемые значения отклоняются на boundary
