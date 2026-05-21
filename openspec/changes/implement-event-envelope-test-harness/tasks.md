## Tasks

- [ ] 1. Определить место общего test harness для foundation event-линии.
- [ ] 2. Зафиксировать обязательный состав MVP harness:
  - [ ] 2.1 builders/fixtures для валидного `EventEnvelope`
  - [ ] 2.2 отрицательные fixtures для ошибок envelope contract
  - [ ] 2.3 stub/no-op fixtures и helper'ы для runtime-boundary log sink
- [ ] 3. Уточнить, какие проверки harness покрывает сейчас:
  - [ ] 3.1 static/contract и unit-проверки инвариантов `EventEnvelope`
  - [ ] 3.2 service-level проверки общего log boundary без реального storage
  - [ ] 3.3 traceability-связку foundation-сценариев с командами запуска
- [ ] 4. Явно зафиксировать deferred-объём:
  - [ ] 4.1 payload fixtures для `experience`, `action`, `cost`
  - [ ] 4.2 producer wiring tests
  - [ ] 4.3 browser/e2e, live/provider и storage-backed integration
- [ ] 5. Определить правило для `test/traceability/coverage-plan.json`:
  - [ ] 5.1 запись нужна только при сознательном переносе foundation coverage
  - [ ] 5.2 отсутствие producer-level тестов само по себе не требует записи
- [ ] 6. Зафиксировать команды запуска и expected test levels для downstream producer changes, которые будут использовать harness.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: foundation event-линия получает общий test harness.
- `event-envelope`: contract покрыт reusable fixtures/builders и traceability.
- `projects` / runtime log boundary: общий sink boundary покрыт service-level harness без storage.
- `experience`, `action`, `cost`: только как downstream consumers foundation harness; их собственные fixtures/tests в этот MVP не входят.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется, если service-level сценарии закрываются stub/no-op boundary.
- service-level без storage: обязательный для общего log boundary.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- Если foundation service-level проверки живут внутри unit-контура, отдельная integration-команда не требуется.

Mock/fixture-данные и credentials:
- reusable foundation event fixtures для валидных и невалидных envelope-сценариев;
- reusable stub/no-op log boundary fixtures без реального storage;
- live credentials не нужны.

Условие для `coverage-plan.json`:
- запись нужна только если после внедрения harness хотя бы один foundation-сценарий из этого change остаётся без трассируемой проверки или его обязательная автоматизация переносится в следующий change;
- если отложены только producer-specific tests (`experience`, `action`, `cost`), запись не требуется.
