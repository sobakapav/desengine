## ADDED Requirements

### Requirement: Проект показывает свою историю и диагностику

Система SHALL показывать пользователю project-scoped историю и diagnostics, уже накопленные внутри canonical runtime проекта.

#### Scenario: Пользователь открывает историю проекта
- **WHEN** пользователь открывает страницу проекта
- **THEN** система показывает project-scoped историю работы
- **AND** история опирается на canonical runtime данные проекта

#### Scenario: Пользователь видит migration и reset след проекта
- **WHEN** у проекта есть migration status или reset-related след
- **THEN** система показывает это как часть диагностики проекта
- **AND** не прячет важные последствия project-level изменений
