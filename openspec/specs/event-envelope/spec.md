## Requirements

### Requirement: EventEnvelope задаёт общий foundation-контракт события

Система SHALL описывать product events через единый `EventEnvelope` с обязательными полями `eventId`, `kind`, `occurredAt`, `scope`, `privacyClass`, `redactionState` и `payload`.

#### Scenario: Runtime создаёт project-scoped событие
- **WHEN** foundation-слой создаёт событие уровня проекта
- **THEN** `scope` содержит только `projectId`
- **AND** envelope проходит общий source-contract

#### Scenario: Runtime создаёт workflow-step-scoped событие
- **WHEN** foundation-слой создаёт событие уровня workflow step
- **THEN** `scope` содержит `projectId` и `workflowStepId`
- **AND** envelope проходит общий source-contract

#### Scenario: Runtime создаёт workbench-instance-scoped событие
- **WHEN** foundation-слой создаёт событие уровня workbench instance
- **THEN** `scope` содержит `projectId` и `workbenchInstanceId`
- **AND** envelope проходит общий source-contract

#### Scenario: Envelope без обязательного поля отклоняется
- **WHEN** caller передаёт envelope без одного из обязательных полей
- **THEN** source-contract отклоняет такой input

#### Scenario: Смешанный scope отклоняется
- **WHEN** caller передаёт scope вне MVP-матрицы
- **THEN** source-contract отклоняет такой input

#### Scenario: Privacy и redaction значения валидируются
- **WHEN** caller передаёт недопустимый `privacyClass` или `redactionState`
- **THEN** source-contract отклоняет такой input

### Requirement: Payload families переиспользуют общий envelope

Система SHALL строить foundation fixtures для `experience`, `action` и `cost` поверх общего `EventEnvelope`, а не через локальные ad-hoc shape.

#### Scenario: Experience payload использует общий envelope
- **WHEN** foundation-слой строит fixture события опыта
- **THEN** payload family `experience` живёт внутри общего envelope

#### Scenario: Action payload использует общий envelope
- **WHEN** foundation-слой строит fixture события действия
- **THEN** payload family `action` живёт внутри общего envelope

#### Scenario: Cost payload использует общий envelope
- **WHEN** foundation-слой строит fixture события затрат
- **THEN** payload family `cost` живёт внутри общего envelope
