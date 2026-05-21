## Context

Первые два implement changes создают foundation-слой: общий контракт события и runtime-boundary записи. Чтобы эта линия действительно стала общей, нужен отдельный тестовый слой, который закрепит её как reusable baseline для следующих волн.

## Decisions

1. Test harness выделяется в отдельный implement change под `dispatcher-test-system`, а не растворяется в предыдущих двух changes.

2. Harness должен покрыть два уровня:
   - contract/unit проверки общего envelope;
   - service-level проверки runtime-boundary без storage.

3. Harness должен хранить общие fixtures и helper'ы в одном месте, чтобы downstream producers опирались на них, а не создавали параллельные test seeds.

4. Если downstream runtime-flow уже появился, harness всё равно выбирает в качестве канонического surface общий foundation contract `@/lib/system/events`; локальные ad-hoc event shape считаются противоречием и не входят в допустимый baseline.

5. Первый заход фиксирует только foundation baseline. Producer-specific payload samples и сценарии `experience` / `action` / `cost` не обязательны, пока они не нужны для проверки общего envelope или общего log boundary.

6. `coverage-plan.json` нужен не по факту отсутствия producer tests, а только по факту осознанного gap в заявленном foundation coverage.

## MVP Scope

В рамках первого захода change должен дать:

- обязательные fixtures/builders для foundation `EventEnvelope`:
  - минимум один валидный envelope fixture;
  - минимум один helper для вариаций scope/privacy/redaction;
  - минимум один отрицательный fixture для contract failure;
- обязательные fixtures/helpers для runtime-boundary:
  - stub или `no-op` sink;
  - helper для фиксации записанных envelopes;
  - helper для проверки отказа на невалидном входе без storage;
- foundation traceability mapping для сценариев общего envelope, общего log boundary и самого testing-layer;
- зафиксированные test levels и команды запуска для foundation-проверок;
- запись в `coverage-plan.json` только если обнаружен непокрытый foundation gap.

## Deferred

Откладывается:

- отдельная библиотека fixture payloads для `experience`, `action`, `cost`;
- producer wiring tests, которые проверяют конкретные источники событий;
- browser/e2e smoke событийных пользовательских flows;
- live/provider checks;
- domain-specific producer tests `experience`, `action`, `cost`;
- любые storage-backed integration проверки.

## Risks / Trade-offs

- [Риск] Harness начнёт дублировать тесты из предыдущих implement changes.
  → Mitigation: выносить только общую reusable основу и traceability, а не повторять весь unit-suite.

- [Риск] В MVP по ошибке попадут producer-specific fixtures, и foundation harness снова размоется.
  → Mitigation: считать обязательными только envelope/log-boundary helpers без доменной семантики.

- [Риск] Deferred coverage не будет явно зафиксирован.
  → Mitigation: обновлять `coverage-plan.json` только при непокрытом foundation-сценарии, а не как формальность из-за отсутствия downstream producers.
