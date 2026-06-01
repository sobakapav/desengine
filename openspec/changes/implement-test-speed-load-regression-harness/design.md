## Context

`producer-speed-and-load` уже выделил классы рисков, а `dispatcher-test-system` отвечает за единый тестовый слой. Следующий системный шаг после отдельных budget verdicts — reusable harness, который одинаково прогоняет speed/load сценарии и не заставляет каждую downstream ветку заново собирать свои fixtures.

## Goals

- Сделать единый harness для speed/load regressions.
- Переиспользовать его в budget tests и future guardrail checks.
- Удержать deterministic fixture strategy без live credentials.

## Non-goals

- Не строить heavyweight benchmark lab.
- Не обещать machine-agnostic абсолютные performance числа.
- Не смешивать harness с production telemetry.

## Decisions

1. Harness должен быть scenario-oriented.
   - cold/warm, repeated actions, overload, oversize.

2. Harness должен быть reusable, а не привязанным к одному тесту.

3. Fixture/stub boundary важнее живого realism.
   - Для обязательного слоя важна повторяемость, а не максимальная близость к live-run.

## Risks / Trade-offs

- Слишком общий harness может оказаться слишком абстрактным и неудобным.
- Слишком узкий harness снова породит дубли downstream.
- Придётся удержать границу между integration realism и обязательной воспроизводимостью.

## Open Questions

- Где лучше жить harness surface: `test/helpers`, `test/integration` или отдельный `tools/testing` слой.
- Нужен ли bridge между этим harness и browser verification runtime в дальнейших волнах.
