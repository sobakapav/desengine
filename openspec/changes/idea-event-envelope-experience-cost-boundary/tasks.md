## Tasks

- [ ] 1. Ввести `EventEnvelope` contract.
- [ ] 2. Определить payload profiles для experience/action/cost MVP.
- [ ] 3. Зафиксировать privacy/redaction/export/delete policy.
- [ ] 4. Добавить local-first event storage adapter или contract stub.
- [ ] 5. Обновить OpenSpec specs `event-envelope`, `experience`, `cost-accounting`.
- [ ] 6. Добавить unit/contract tests.
- [ ] 7. Прогнать `npm run test:unit`, `npm run test:traceability`.

## Тестовая часть change

Затронутые capability/scenarios:
- `event-envelope`: событие имеет scope, privacy class и redaction state.
- `experience`: experience events используют общий envelope.
- `cost-accounting`: cost events используют общий envelope и metadata-only policy.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- integration/e2e: не требуется для contract MVP.

Команды:
- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:
- Fixture prompt event, action event, cost event; live credentials не нужны.
