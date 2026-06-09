## ADDED Requirements

### Requirement: Project UI kit migration может откатывать несовместимый progress

Система SHALL уметь переоценивать валидность task progress после смены базового `UI kit` проекта.

#### Scenario: Несовместимая задача откатывается после migration
- **WHEN** пользователь меняет базовый `uiKitId` проекта
- **AND** текущая задача или её progress больше не совместимы с новым project contract
- **THEN** система больше не считает этот progress валидным
- **AND** откатывает задачу или затронутый уровень в состояние, требующее повторного прохождения

#### Scenario: Совместимый progress сохраняется после migration
- **WHEN** пользователь меняет базовый `uiKitId` проекта
- **AND** часть task progress остаётся совместимой с новым project contract
- **THEN** система сохраняет совместимый progress
- **AND** не выполняет безусловный глобальный reset всех задач проекта
