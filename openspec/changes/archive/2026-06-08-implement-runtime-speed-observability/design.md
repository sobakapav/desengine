## Context

`dispatcher-runtime` уже отвечает за action/service/mutation boundaries. В коде есть фрагментарные сигналы вроде `durationMs`, `llmCall.metrics` и отдельных console-логов, но они не образуют цельный observability contract.

Для speed/load линии это проблема: пока диагностика неструктурна, мы не можем последовательно:
- объяснить speed regression;
- связать runtime-path с budget verdict;
- понять, где именно сработал guardrail.

## Goals

- Ввести structured diagnostics surface для speed/load paths.
- Сделать этот surface пригодным и для локальной диагностики, и для тестового слоя.
- Не тащить внешнюю telemetry-инфраструктуру в обязательный контур.

## Non-goals

- Не строить product analytics backend.
- Не смешивать observability с event log или business telemetry.
- Не делать из diagnostics user-facing UI feature в этом change.

## Decisions

1. Diagnostics должны быть structured-first.
   - Иначе downstream tests и tooling не смогут их переиспользовать.

2. Нужно покрыть не только success path, но и overload/degradation paths.

3. Observability остаётся локальным runtime contract, а не внешней облачной системой.

## Risks / Trade-offs

- Слишком шумная диагностика усложнит чтение логов.
- Слишком бедный shape не даст реальной пользы producer/test layers.
- Нужно удержать границу между useful diagnostics и лишним runtime overhead.

## Open Questions

- Где должен жить канонический diagnostics shape: в runtime helper, event-like envelope или отдельном module contract.
- Нужно ли в этой волне сразу сохранять diagnostics в memory buffer/file, или достаточно structured logging surface.
