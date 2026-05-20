## ADDED Requirements

### Requirement: EventEnvelope задаёт общий scope и privacy contract

Система SHALL описывать experience, action и cost events через общий EventEnvelope.

#### Scenario: Runtime записывает событие проекта
- **WHEN** система создаёт событие о работе пользователя
- **THEN** событие содержит `projectId`, `createdAt`, `privacyClass` и `redactionState`
- **AND** payload соответствует профилю события
