## ADDED Requirements

### Requirement: Проект показывает workflow как наблюдаемый слой

Система SHALL позволять пользователю видеть project-aware workflow как часть страницы проекта, даже если управление workflow пока остаётся read-only.

#### Scenario: Пользователь открывает workflow проекта
- **WHEN** пользователь открывает страницу проекта
- **THEN** система показывает текущий workflow step проекта
- **AND** объясняет связь workflow с компонентной линией проекта и Workbench
