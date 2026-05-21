## MODIFIED Requirements

### Requirement: Project Workspace является canonical project scope

Система SHALL иметь единую project-scoped boundary записи product event рядом с runtime проекта, чтобы downstream changes не создавали конкурирующие entrypoint'ы.

#### Scenario: Runtime записывает product event через единую project boundary
- **WHEN** project runtime передаёт валидный `EventEnvelope` в boundary записи события
- **THEN** boundary принимает только foundation contract `EventEnvelope`
- **AND** по умолчанию использует один `stub/no-op` sink без storage
