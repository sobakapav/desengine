## Context

Performance-жалобы почти всегда приходят в размытом виде. Пользователь чувствует «тормозит», но без сценария, этапа и измерения такой сигнал нельзя качественно починить.

Это делает speed-quality отдельной управленческой проблемой: прежде чем заводить fixes, нужен контур сбора evidence и baseline.

## Goals

- Поднять тему скорости в отдельную quality-линию.
- Подготовить основу для performance triage и evidence collection.
- Разделить UI/runtime/network/LLM источники latency.

## Non-goals

- Не строить полный performance platform в этом change.
- Не назначать конкретные SLA без baseline.

## Decisions

1. Жалоба «система тормозит» переводится в `idea`, а не в немедленный `fix`.
2. Для speed-quality создаётся отдельный roadmap внутри `focus-quality`.
3. Первым downstream шагом вероятнее всего будет `producer`, а не `fix`.

## Risks

- Без дисциплины идея останется декларацией и не превратится в измеримый контур.
- Слишком ранняя фиксация метрик без baseline может породить ложные алерты.

## Open Questions

- Какие именно user journeys должны получить baseline первыми.
- Нужен ли отдельный dispatcher performance quality или достаточно producer + targeted fixes.
