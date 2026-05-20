## ADDED Requirements

### Requirement: Cost events используют общий EventEnvelope

Система SHALL хранить события стоимости как metadata-oriented payload общего EventEnvelope.

#### Scenario: LLM usage записывается как cost event
- **WHEN** LLM flow возвращает provider metrics
- **THEN** cost event содержит метрики и scope
- **AND** не хранит секреты или полный prompt text без явного решения
