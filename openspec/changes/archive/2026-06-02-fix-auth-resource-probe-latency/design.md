## Goals

- Убрать последовательное ожидание независимых network probes внутри `getResourceStates()`.
- Сохранить текущие `ResourceId`, conditions, тексты и remediation controls без semantic drift.
- Зафиксировать новый runtime contract адресным unit-тестом.

## Non-goals

- Не пересобирать всю auth/system diagnostics архитектуру.
- Не менять таймауты probes, provider semantics или allowlist contract.
- Не пытаться этим change закрыть browser-level Safari narrative целиком.

## Design

`getResourceStates()` уже собирает базовое состояние (`getLlmStatus`, `getAccessSessionState`, onboarding, release) через `Promise.all`. Узкое место возникало ниже: после `addAccessAndReleaseResources(...)` код последовательно ждал `addLlmResources(...)`, а затем `addAllowlistResources(...)`, хотя эти операции независимы и обе делают собственные network probes.

Исправление narrow: запускать оба network probe параллельно, но не писать их сразу в общий collector. Каждый probe собирает свои ресурсы во временный collector, после чего `getResourceStates()` мерджит результаты обратно в стабильном порядке `llm -> allowlist`. Это не меняет shape результата и не переставляет бизнес-решения по статусам; меняется только orchestration latency.

## Testing

- Unit: новый тест подтверждает, что оба probes стартуют параллельно.
- Unit regression: существующий `resource-status` слой остаётся зелёным и подтверждает, что итоговые resource contracts не сломаны.
