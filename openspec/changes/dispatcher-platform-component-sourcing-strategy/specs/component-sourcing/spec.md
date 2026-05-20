## ADDED Requirements

### Requirement: Platform primitives выбираются через sourcing decision

Система разработки SHALL для новых platform primitives выбирать стратегию `reuse`, `adapt` или `build` до реализации.

#### Scenario: Команда добавляет новый Workbench tool
- **WHEN** change добавляет новый инструмент Workbench
- **THEN** в change зафиксирован sourcing decision
- **AND** decision объясняет, почему команда использует готовую библиотеку, adapter или собственную реализацию
- **AND** выбранный primitive имеет тестовый уровень и fallback/degradation strategy

#### Scenario: Готовая библиотека не должна протекать в домен
- **WHEN** готовый component/runtime API используется внутри domain-sensitive слоя
- **THEN** он закрывается adapter/facade boundary
- **AND** доменные сущности Project/Task/Workflow/Artifact/Event не зависят напрямую от API библиотеки
