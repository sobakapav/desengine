## Tasks

- [ ] 1. Зафиксировать границы подсистемы тестирования и её область ответственности.
- [ ] 2. Описать классы дочерних changes: producer, implement, cleanup, release follow-up.
- [ ] 3. Определить базовые guardrails для уровней проверки, команд запуска, mock/fixture-данных и live credentials.
- [ ] 4. Связать будущие изменения тестовой подсистемы с `testing-layer` и traceability-практикой.
  - [ ] 4.1 первая event-line волна: `implement-event-envelope-test-harness`
  - [ ] 4.2 наблюдаемый runtime-step: `implement-screen-event-envelope-propagation`

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: тестовая подсистема получает отдельный управляющий change.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется, dispatcher не меняет runtime.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change документирует governance-слой без runtime-изменений.

Если покрытие откладывается:
- Не требуется: dispatcher не вводит runtime behavior.
