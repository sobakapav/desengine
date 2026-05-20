## ADDED Requirements

### Requirement: Experience events используют общий EventEnvelope

Система SHALL хранить события опыта пользователя как payload profile общего EventEnvelope.

#### Scenario: Prompt становится событием опыта
- **WHEN** пользователь запускает prompt
- **THEN** experience event ссылается на project/task/workflow context
- **AND** privacy/redaction правила применяются до экспорта
