## ADDED Requirements

### Requirement: Active capability architecture-roadmap синхронизирован с routing playbook

Система SHALL иметь active capability `architecture-roadmap` в `openspec/specs/**`, если traceability и unit-доказательства архитектурного routing уже ссылаются на этот capability.

#### Scenario: Unit traceability ссылается на active architecture-roadmap
- **WHEN** unit-тест или другой runnable evidence использует metadata `@openSpec capability: architecture-roadmap`
- **THEN** в active слое существует `openspec/specs/architecture-roadmap/spec.md`
- **AND** spec содержит сценарии routing/evidence, на которые реально ссылается доказательство

#### Scenario: Архивный контракт не остаётся единственным источником истины
- **WHEN** capability `architecture-roadmap` уже описан только в archived change
- **THEN** active слой получает синхронизированный контракт без подмены смысла на другой capability
- **AND** downstream traceability продолжает ссылаться на тот же архитектурный предмет доказательства
