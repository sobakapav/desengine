## Why

`user-experience-generalization`, `user-action-logging` и `cost-accounting-layer` все хотят писать события о работе пользователя. Если реализовать их независимо, появятся три журнала с разными scoping/privacy/export/delete правилами.

Этот change вводит общий privacy-first EventEnvelope, который потом используют experience, action log и cost accounting.

## What Changes

- Вводится `EventEnvelope` с project/task/workflow/workbench scoping.
- Определяется privacy class, redaction state, retention/export/delete policy.
- Experience events, action events и cost events становятся payload-профилями общего envelope.
- MVP остаётся local-first и user-owned.

## Non-goals

- Не реализуем аналитику, dashboard или автоматическую генерацию навыков.
- Не отправляем события в облако.
- Не логируем секреты или полный high-frequency трекинг по умолчанию.

## Capabilities

### New Capabilities

- `event-envelope`: общий контракт событий.
- `experience`: события опыта как payload profile.
- `cost-accounting`: события стоимости как payload profile.

### Modified Capabilities

- `projects`, `task-model`, `workflow`: events получают scope через эти сущности.

## Acceptance Criteria

- Есть типизированный EventEnvelope contract.
- Experience/action/cost events используют общий envelope, а не отдельные scoping rules.
- Есть privacy/redaction/export/delete правила для MVP.
- Есть unit/contract tests и traceability.
