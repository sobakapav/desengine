## Requirements

### Requirement: Project Workspace является canonical project scope

Система SHALL иметь единую сущность `ProjectWorkspace` для настроек и данных проекта.

#### Scenario: Пользователь открывает lab в активном проекте
- **WHEN** пользователь открывает лабораторию
- **THEN** runtime определяет active project через project boundary
- **AND** настройки preview берутся из `ProjectWorkspace.settings`

#### Scenario: Настройки preview сохраняются в project settings
- **WHEN** пользователь меняет `uiKitId` или `uiMode`
- **THEN** изменение сохраняется как настройка `ProjectWorkspace.settings`
- **AND** Workbench не создаёт отдельный несовместимый Project shape
