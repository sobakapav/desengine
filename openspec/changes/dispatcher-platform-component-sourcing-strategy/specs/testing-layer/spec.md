## MODIFIED Requirements

### Requirement: Добавляется новый behavior-change

Система SHALL требовать явную тестовую часть для каждого behavior-change.

#### Scenario: Change выбирает platform primitive
- **WHEN** behavior-change добавляет или меняет готовую библиотеку, UI/runtime primitive или adapter/facade для Workbench tool
- **THEN** тестовая часть change указывает affected capability/scenarios и sourcing decision
- **AND** тестовый уровень соответствует роли primitive: static/contract для governance, unit для adapter boundary, component/browser для UX primitive, live/provider только при явной внешней интеграции
- **AND** если автоматическая проверка adapter или UX primitive откладывается, запись добавляется в `test/traceability/coverage-plan.json`
