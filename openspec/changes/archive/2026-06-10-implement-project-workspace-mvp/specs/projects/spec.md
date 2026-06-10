## MODIFIED Requirements

### Requirement: Project Workspace является canonical project scope

Система SHALL иметь единую сущность `ProjectWorkspace` для настроек и данных проекта.

#### Scenario: Пользователь создаёт новый проект
- **WHEN** пользователь создаёт проект в первой MVP-волне
- **THEN** система создаёт `ProjectWorkspace` с `id`, именем, `createdAt`, `updatedAt` и `settings`
- **AND** в `ProjectWorkspace.settings` сразу фиксируется базовый `uiKitId`
- **AND** проект не считается валидным без имени и базового `UI kit`

#### Scenario: Пользователь открывает lab в активном проекте
- **WHEN** пользователь открывает лабораторию
- **THEN** runtime определяет active project через project boundary
- **AND** настройки preview берутся из `ProjectWorkspace.settings`

#### Scenario: Настройки preview сохраняются в project settings
- **WHEN** пользователь меняет `uiKitId` или `uiMode`
- **THEN** изменение сохраняется как настройка `ProjectWorkspace.settings`
- **AND** Workbench не создаёт отдельный несовместимый Project shape

### Requirement: Project registry определяет active project context

Система SHALL хранить список доступных проектов и явный active project context как часть project boundary.

#### Scenario: Первый созданный проект становится активным
- **WHEN** в системе ещё нет ни одного проекта
- **AND** пользователь создаёт первый `ProjectWorkspace`
- **THEN** этот проект попадает в project registry
- **AND** система делает его active project

#### Scenario: Пользователь переключает active project
- **WHEN** в project registry есть несколько проектов
- **AND** пользователь выбирает другой проект
- **THEN** active project context обновляется через project boundary
- **AND** лаборатория и downstream runtime читают уже новый active project, а не старый локальный state
