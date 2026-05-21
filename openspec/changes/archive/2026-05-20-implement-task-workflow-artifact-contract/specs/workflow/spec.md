## ADDED Requirements

### Requirement: Workflow связывает шаги работы и их состояние

Система SHALL описывать последовательность работы через WorkflowInstance и WorkflowStepInstance.

#### Scenario: Lab level является workflow step
- **WHEN** пользователь работает с уровнем lab
- **THEN** текущий уровень может быть представлен как WorkflowStepInstance
- **AND** входные и выходные данные шага описаны через artifacts
