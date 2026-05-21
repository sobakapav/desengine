## Requirements

### Requirement: Platform primitives выбираются через sourcing decision

Система SHALL для новых platform primitives фиксировать стратегию `reuse`, `adapt` или `build` до того, как runtime-зависимость или tool contract попадут в рабочий слой.

#### Scenario: Команда добавляет новый Workbench tool
- **WHEN** change добавляет новый инструмент Workbench
- **THEN** registry и связанный OpenSpec change фиксируют sourcing decision
- **AND** decision объясняет, почему выбран `reuse`, `adapt` или `build`
- **AND** выбранный primitive имеет test level и fallback/degradation strategy

#### Scenario: Готовая библиотека не должна протекать в домен
- **WHEN** готовый component или runtime используется внутри domain-sensitive слоя
- **THEN** он закрывается adapter/facade boundary
- **AND** доменные сущности Project/Task/Workflow/Artifact/Event не зависят напрямую от API библиотеки
