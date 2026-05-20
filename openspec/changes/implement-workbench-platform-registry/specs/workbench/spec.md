## ADDED Requirements

### Requirement: Workbench имеет definition и instance

Система SHALL описывать рабочий стол через WorkbenchDefinition и WorkbenchInstance.

#### Scenario: Lab workbench регистрируется как definition
- **WHEN** runtime открывает текущий lab workbench
- **THEN** он может определить WorkbenchDefinition
- **AND** WorkbenchInstance связан с project/task/workflow step
