## ADDED Requirements

### Requirement: Task runtime работает внутри active project context

Система SHALL строить task runtime и task projection внутри active project context, а не как изолированный task-only flow.

#### Scenario: Пользователь открывает задачу внутри активного проекта
- **WHEN** пользователь открывает задачу при выбранном active project
- **THEN** task runtime получает `projectId` как часть базового контекста
- **AND** task/opening flow не откатывается к безымянному project-less состоянию

#### Scenario: Task runtime не теряет project context при действиях пользователя
- **WHEN** пользователь выполняет `start`, `iterate`, `check`, `save files`, `reset task` или `reset current level`
- **THEN** runtime выполняет действие внутри того же active project context
- **AND** task flow не продолжает жить как глобальный поток вне проекта
