## Tasks

- [ ] 1. Зафиксировать роль `dispatcher-log-system` как управляющего контура product event log.
- [ ] 2. Описать границу между общим event contract и системой журналирования.
- [ ] 3. Зафиксировать MVP-рамки local-first log system без выбора тяжёлой технологии.
- [ ] 4. Определить, какие lifecycle-вопросы ограничиваются правилами, а не реализацией.
- [ ] 5. Подготовить roadmap на будущие implement/storage changes.
  - [ ] 5.1 `implement-log-system-runtime-boundary`
- [ ] 6. Согласовать тестовый след будущих log-system изменений с `dispatcher-test-system`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `event-envelope`: будущая лог-система использует общий event contract.
- `projects`: product event log должен поддерживать project-scoped lifecycle.
- `testing-layer`: будущие log-system implementation changes обязаны иметь traceability.

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
