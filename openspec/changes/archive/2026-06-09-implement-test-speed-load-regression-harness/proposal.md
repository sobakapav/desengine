## Why

Даже при наличии отдельных budget verdicts тестовому слою нужен общий harness, который воспроизводит speed/load сценарии одинаковым способом. Иначе каждая новая проверка будет собирать собственные fixtures и по-разному мерить одну и ту же нагрузку, а producer-контекст снова расползётся.

## What Changes

- Вводится implement-change `implement-test-speed-load-regression-harness` под `dispatcher-test-system`.
- Change должен создать reusable regression harness для speed/load линии:
  - cold/warm сценарии;
  - repeated preview rebuild;
  - repeated `iterate` / `check`;
  - backlog / overload-path;
  - oversized input/output refusal.
- Harness должен быть пригоден как основа для downstream budget tests, а не только для одной проверки.
- Harness должен работать на fixtures/stubs без live credentials и без ручного браузерного взаимодействия.

## Non-goals

- Не превращать этот harness в полноценный external benchmark framework.
- Не заменять unit-тесты отдельных runtime-модулей.
- Не тащить live provider или machine-specific profiler в обязательный слой.

## Capabilities

### Modified Capabilities

- `testing-layer`: у speed/load линии появляется reusable regression harness для controlled сценариев деградации и перегруза.

## Acceptance Criteria

- Есть reusable harness для speed/load сценариев.
- Downstream checks переиспользуют общий fixture/runtime surface вместо локальных ad-hoc замеров.
- Harness умеет воспроизводить минимум cold/warm, repeated actions и overload/oversize paths.
- В tasks зафиксированы integration/static проверки и fixture strategy.
