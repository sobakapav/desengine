## MODIFIED Requirements

### Requirement: Лаборатория использует Project Workspace для Sandpack preview

#### Scenario: Лаборатория строит preview semantics внутри project contract
- **WHEN** пользователь открывает рабочую лабораторию задачи
- **THEN** система читает `ProjectWorkspace.settings` как часть project contract
- **AND** preview/workbench semantics больше не живут как локальный UI-state поверх task-only потока
