## MODIFIED Requirements

### Requirement: Workbench имеет definition и instance

Система SHALL описывать рабочий стол через WorkbenchDefinition и WorkbenchInstance.

#### Scenario: Lab workbench регистрируется как definition
- **WHEN** runtime открывает текущий lab workbench
- **THEN** он может определить WorkbenchDefinition
- **AND** WorkbenchInstance связан с project/task/workflow step

#### Scenario: Workbench tool фиксирует sourcing decision
- **WHEN** change добавляет новый Workbench tool или меняет platform primitive существующего tool
- **THEN** WorkbenchDefinition или связанный OpenSpec change фиксирует sourcing decision `reuse`, `adapt` или `build`
- **AND** decision указывает owner boundary, adapter/facade policy и test level
- **AND** доменные сущности Project/Task/Workflow/Artifact/Event не зависят напрямую от API выбранной библиотеки
