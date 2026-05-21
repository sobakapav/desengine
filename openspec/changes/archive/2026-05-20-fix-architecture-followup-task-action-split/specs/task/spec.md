## MODIFIED Requirements

### Requirement: Route handlers используют переиспользуемые lab action services

Система SHALL держать core logic lab action flow в переиспользуемом runtime/service слое, а route handlers использовать как HTTP boundary.
Task service boundary SHALL строить prompt-related runtime context через PromptContext builder, а не через отдельные ad-hoc модели в start/iterate/check flows.

#### Scenario: Пользователь запускает уровень через service boundary
- **WHEN** API route запускает текущий уровень задачи
- **THEN** route handler делегирует доменную логику runtime/service функции
- **AND** HTTP response contract для пользователя не меняется
- **AND** service flow строит PromptContext через общий builder
- **AND** start-flow helpers остаются частью task action service boundary, а не route handler
