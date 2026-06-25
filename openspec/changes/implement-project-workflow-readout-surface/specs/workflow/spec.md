## ADDED Requirements

### Requirement: Project-aware workflow доступен для пользовательского readout

Система SHALL давать read-only доступ к project-aware workflow/artifact surface без изменения underlying orchestration.

#### Scenario: Пользователь видит project-aware artifacts и bindings
- **WHEN** система показывает workflow проекта
- **THEN** пользователь видит project-aware artifacts и runtime bindings
- **AND** readout не требует редактирования workflow для понимания текущего состояния
