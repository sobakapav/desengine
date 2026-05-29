## Context

`resource-status` должен сообщать правду о системных ресурсах. Для LLM это особенно важно: пользователь ориентируется на `/system`, когда `start` или `iterate` начинают вести себя странно.

Сейчас diagnostic code частично разминулся с provider adapters: runtime и `/system` знают о провайдерах по-разному.

## Goals

- Выровнять diagnostic probe с реальными provider boundaries.
- Не допустить использования OpenAI-specific headers/paths для других провайдеров.

## Non-goals

- Не строить полноценный live/provider healthcheck с реальными task payload.
- Не вводить отдельную диагностику на каждый task target.

## Decisions

1. Provider probe должен определяться provider boundary.
   - URL, метод и auth header не должны вычисляться generic fallback-логикой.

2. `llm-network` должен различать:
   - реальную недоступность provider;
   - rejected/unauthorized;
   - внутреннюю некорректность probe-definition.

3. Unit coverage должна держать multi-provider truth.
   - Минимум `claude` и `zai` добавляются в проверку как anti-regression cases.

## Risks / Trade-offs

- [Риск] Для части провайдеров нет дешёвого read-only endpoint.
  → Mitigation: использовать самый безопасный probe, но всё равно отделить его от чужих adapter assumptions.

- [Риск] Исполнитель изменит только headers и оставит неверный endpoint.
  → Mitigation: тесты должны покрывать и URL, и auth semantics.
