## Context

`dispatcher-test-system` уже держит единый тестовый слой, traceability и команды запуска. Но сейчас этот слой почти не выражает speed expectations. В результате производительность обсуждается через симптом и ручное впечатление, а не через общий test verdict.

Для `producer-speed-and-load` нужен системный тестовый ответ на вопрос: не сломали ли мы budget ключевого user-facing пути.

## Goals

- Добавить reusable verdict model для speed budgets.
- Проверять latency regressions в controlled test mode.
- Отделить speed regression от functional regression.

## Non-goals

- Не обещать точные universal SLA для всех машин.
- Не заменять profiler и runtime telemetry тестами.
- Не вводить live/provider performance checks в обязательный слой.

## Decisions

1. Verdict должен быть first-class сущностью тестового слоя.
   - Это не просто лог времени, а понятный результат для change/traceability.

2. Budget assertions должны идти на fixture-controlled путях.
   - Иначе тестовый слой будет слишком flaky.

3. Набор сценариев должен быть small-but-representative.
   - Сначала key paths `start`, `iterate`, `check`, preview build и lab entry.

## Risks / Trade-offs

- Слишком узкие budgets дадут flaky verdicts.
- Слишком широкие budgets не будут ловить реальные regressions.
- Понадобится аккуратно отделить speed-budget failure от infra noise.

## Open Questions

- Нужен ли единый DSL для budget assertions или достаточно нескольких focused helpers.
- Какие сценарии сразу вести в unit/integration, а какие оставлять для browser/integration harness.
