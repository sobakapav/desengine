## ADDED Requirements

### Requirement: Preview и workbench contract используют project settings как часть project boundary

Система SHALL использовать `project.settings` как часть project boundary для preview и workbench contract, а не как локальный переключатель UI.

#### Scenario: Preview contract читает project settings из active project
- **WHEN** task runtime строит preview/workbench contract для текущей задачи
- **THEN** `project.settings.uiKitId` и `project.settings.uiMode` читаются из active project context
- **AND** не подменяются ad-hoc локальным состоянием лаборатории
