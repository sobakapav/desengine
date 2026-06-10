## Requirements

### Requirement: Project Workspace является canonical project scope

Система SHALL иметь единую сущность `ProjectWorkspace` для настроек и данных проекта.

#### Scenario: Пользователь создаёт первый проект в MVP workspace
- **WHEN** в registry ещё нет ни одного проекта
- **AND** пользователь создаёт первый `ProjectWorkspace` с именем
- **THEN** система сохраняет canonical `ProjectWorkspace` с `id`, `title`, `createdAt`, `updatedAt` и `settings`
- **AND** в `ProjectWorkspace.settings` сразу фиксируется базовый `uiKitId` и `uiMode`
- **AND** этот проект становится active project через project boundary

#### Scenario: Пользователь открывает lab в активном проекте
- **WHEN** пользователь открывает лабораторию
- **THEN** runtime определяет active project через project boundary
- **AND** настройки preview берутся из `ProjectWorkspace.settings`

#### Scenario: Пользователь переключает active project через project registry
- **WHEN** в registry доступно несколько `ProjectWorkspace`
- **AND** пользователь выбирает другой проект
- **THEN** project boundary сохраняет новый active project
- **AND** лаборатория и preview читают уже выбранный `ProjectWorkspace`, а не task-local fallback

#### Scenario: Настройки preview сохраняются в project settings
- **WHEN** пользователь меняет `uiKitId` или `uiMode`
- **THEN** изменение сохраняется как настройка `ProjectWorkspace.settings`
- **AND** Workbench не создаёт отдельный несовместимый Project shape

#### Scenario: Смена project UI kit запускает явную migration-операцию
- **WHEN** пользователь подтверждает смену `ProjectWorkspace.settings.uiKitId` в Workbench
- **THEN** система сохраняет целевой `uiKitId` через project boundary только после отдельной migration-операции
- **AND** в `ProjectWorkspace.migration` фиксируется явный status с source/target contract

#### Scenario: Project migration не оставляет скрытое промежуточное состояние
- **WHEN** migration project `UI kit` завершается успешно или с ошибкой
- **THEN** `ProjectWorkspace.migration` сохраняет итоговый status и человекочитаемое сообщение
- **AND** пользователь не остаётся в состоянии, где новый `uiKitId` уже выбран, а последствия для task/workbench не объяснены

#### Scenario: Runtime записывает product event через единую project boundary
- **WHEN** project runtime передаёт валидный `EventEnvelope` в boundary записи события
- **THEN** boundary принимает только foundation contract `EventEnvelope`
- **AND** по умолчанию использует один `stub/no-op` sink без storage
