## MODIFIED Requirements

### Requirement: Лаборатория использует Project Workspace для Sandpack preview

Система SHALL использовать `ProjectWorkspace` для лаборатории, чтобы настройки Sandpack preview были привязаны к project boundary, а не только к локальному preview-state.

#### Scenario: Лаборатория открывается в active project context
- **WHEN** пользователь открывает рабочую лабораторию задачи
- **THEN** система читает active `ProjectWorkspace` через project boundary
- **AND** использует его `settings` для preview/runtime контракта
- **AND** не создаёт второй ad-hoc project shape поверх active project

#### Scenario: Лаборатория сохраняет project settings через canonical boundary
- **WHEN** пользователь меняет `project.settings.uiKitId` или `project.settings.uiMode` в лаборатории
- **THEN** изменение проходит через project storage boundary
- **AND** следующая rehydration лаборатории читает тот же active `ProjectWorkspace`
