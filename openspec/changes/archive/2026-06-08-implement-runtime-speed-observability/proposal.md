## Why

Сейчас `producer-speed-and-load` уже видит потенциально дорогие участки кода, но у самой системы почти нет встроенного ответа на вопрос "что именно было дорогим в этом прогоне". Есть отдельные `durationMs` в некоторых логах и `llmCall.metrics`, но нет цельного runtime observability слоя для speed/load линии.

Без этого:
- speed regressions сложнее локализовать;
- backlog/guardrail decisions будут приниматься вслепую;
- тестовые budget verdicts не смогут опираться на канонический runtime diagnostics surface.

## What Changes

- Вводится implement-change `implement-runtime-speed-observability` под `dispatcher-runtime`.
- Change должен добавить structured runtime diagnostics для key paths `npm run start`:
  - preview payload build;
  - `start`;
  - `iterate`;
  - `check`;
  - mutation backlog / overload refusals;
  - cache hit/miss и bounded degradation paths там, где они уже появятся.
- Наблюдаемость должна быть пригодна для локальной диагностики и для downstream test harness, но не обязана сразу превращаться в внешнюю telemetry/analytics систему.
- Diagnostics surface должен помогать отвечать минимум на три вопроса:
  - где spent time;
  - где spent size/load budget;
  - где path был деградирован или отвергнут guardrail'ом.

## Non-goals

- Не строить облачную аналитику или внешний metrics backend.
- Не превращать product event log в speed observability subsystem.
- Не заменять budget tests и regression harness runtime-логами.

## Capabilities

### Modified Capabilities

- `task`: task action runtime получает structured diagnostics для speed/load paths.
- `level-labs`: preview/runtime path получает канонический diagnostics surface.
- `testing-layer`: downstream tests могут опираться на единый runtime diagnostics contract.

## Acceptance Criteria

- Для key paths speed/load линии существует единый diagnostics surface.
- В diagnostics фиксируются duration/size/load-related поля, а не только текстовые сообщения.
- Overload/degradation/budget refusal paths оставляют канонический signal для локальной диагностики.
- В tasks зафиксированы unit/static проверки и границы использования diagnostics.
