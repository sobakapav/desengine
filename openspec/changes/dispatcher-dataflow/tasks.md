## Tasks

- [ ] 1. Зафиксировать роль `dispatcher-dataflow` как управляющего контура технического dataflow.
- [ ] 2. Определить обязательное ядро `EventEnvelope`, допустимые scope-комбинации и propagation-границы.
- [ ] 3. Зафиксировать границу между envelope и payload profiles.
- [ ] 4. Перечислить downstream changes, которые обязаны использовать общий dataflow-contract.
- [ ] 5. Развести по ответственности `dispatcher-dataflow` и `dispatcher-log-system`.
- [ ] 6. Подготовить roadmap на implement changes, которые будут опираться на общий envelope.
  - [ ] 6.1 `implement-event-envelope-contract`
  - [ ] 6.2 `implement-screen-event-envelope-propagation`
  - [ ] 6.3 координация с `implement-log-system-runtime-boundary`

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `event-envelope`: общий контракт событий получает отдельный управляющий dispatcher.
- `dataflow`: технический контур движения продуктовых данных получает отдельный управляющий dispatcher.
- `experience`: downstream experience changes обязаны использовать общий envelope.
- `cost-accounting`: downstream cost changes обязаны использовать общий envelope.

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
