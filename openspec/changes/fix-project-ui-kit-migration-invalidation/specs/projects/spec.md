## ADDED Requirements

### Requirement: Смена project UI kit является migration-операцией

Система SHALL трактовать смену базового `uiKitId` проекта как явную migration-операцию, а не как прозрачный toggle без последствий.

#### Scenario: Пользователь меняет базовый UI kit проекта
- **WHEN** пользователь меняет `ProjectWorkspace.settings.uiKitId`
- **THEN** система запускает compatibility re-check для project-scoped task/workbench контракта
- **AND** не считает миграцию завершённой до фиксации её статуса

#### Scenario: Project migration показывает явный статус
- **WHEN** project migration завершила compatibility re-check
- **THEN** система сохраняет явный migration status
- **AND** пользователь не остаётся в неявном состоянии, где новый `uiKitId` уже выбран, а последствия для задач не объяснены
