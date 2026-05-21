## Tasks

- [ ] 1. Зафиксировать границы подсистемы тестирования и её область ответственности.
- [ ] 2. Описать классы дочерних changes: producer, implement, cleanup, release follow-up.
- [ ] 3. Зафиксировать, что runtime/tooling изменения тестового слоя выполняются только через контролируемые dispatcher'ом `implement`/`fix` changes.
- [ ] 4. Определить базовые guardrails для уровней проверки, команд запуска, mock/fixture-данных и live credentials.
- [ ] 5. Связать будущие изменения тестовой подсистемы с `testing-layer` и traceability-практикой.
  - [ ] 5.1 первая event-line волна: `implement-event-envelope-test-harness`
  - [ ] 5.2 наблюдаемый runtime-step: `implement-screen-event-envelope-propagation`
- [ ] 6. Заполнить handoff и поддерживать его в состоянии, пригодном для передачи исполнения downstream changes.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: тестовая подсистема получает отдельный управляющий change, который направляет code changes через downstream `implement`/`fix`.

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
