## MODIFIED Requirements

### Requirement: Project-aware workflow доступен для пользовательского readout

Система SHALL показывать внутри рабочей workflow-сессии не только внутренний id, но и тот `ProjectComponent`, ради которого эта сессия была открыта.

#### Scenario: Пользователь видит компонент проекта внутри workflow-сессии
- **WHEN** пользователь открывает workflow-сессию компонента проекта
- **THEN** Workbench header явно показывает название `ProjectComponent`
- **AND** пользователь понимает, что текущая workflow/workbench-сессия принадлежит этому компоненту
