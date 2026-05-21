## MODIFIED Requirements

### Requirement: Foundation event-линия переиспользует общий harness

Система SHALL удерживать единый reusable test harness для foundation event-линии, чтобы downstream changes не создавали параллельные тестовые event shape и не дублировали базовые sink-fixtures.

#### Scenario: Foundation event-линия использует общий reusable harness

- **WHEN** downstream change добавляет новую проверку поверх `EventEnvelope`
- **THEN** он переиспользует общий surface builders/fixtures и contract helpers из foundation-линии
- **AND** не вводит второй локальный baseline для тех же scope/privacy/redaction инвариантов

#### Scenario: Runtime-boundary событий проверяется без storage через foundation harness

- **WHEN** команда проверяет общий runtime-boundary записи product events
- **THEN** проверка использует stub/no-op sink и foundation `EventEnvelope`
- **AND** storage, producer wiring и live credentials не требуются
