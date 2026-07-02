## ADDED Requirements

### Requirement: Workflow существует как reusable template проекта

Система SHALL трактовать workflow не только как readout состояния, но и как reusable template проектной работы.

#### Scenario: Пользователь видит workflow template проекта
- **WHEN** пользователь открывает проект
- **THEN** система показывает, какой workflow template выбран для этого проекта
- **AND** template выражает recipe проектной работы, а не только скрытую внутреннюю конфигурацию

#### Scenario: Manifest сохраняет workflow template
- **WHEN** система экспортирует project manifest
- **THEN** manifest включает workflow template проекта
- **AND** импорт manifest восстанавливает этот template без ручной внутренней настройки
