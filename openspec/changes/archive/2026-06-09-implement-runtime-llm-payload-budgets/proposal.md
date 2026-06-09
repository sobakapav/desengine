## Why

В user-facing runtime тяжёлые расходы возникают не только на preview. `start`, `iterate` и `check` собирают крупные инструкции, прикладывают изображения, парсят structured-output и затем пишут результаты в пользовательские файлы. Сейчас у этого пути нет явного budget-контракта:

- размер итоговой инструкции не ограничен;
- число и общий вес входных изображений не описаны как runtime budget;
- размер structured-output и итогового write-set не ограничен явно перед записью;
- parser/normalizer работают на предположении, что ответ уже находится в разумных пределах.

Это риск не только latency, но и machine-level перегруза: CPU, RAM и disk churn на пользовательской машине могут расти без управляемой границы.

## What Changes

- Вводится implement-change `implement-runtime-llm-payload-budgets` под `dispatcher-runtime`.
- Change должен зафиксировать и реализовать bounded runtime contract для `start` / `iterate` / `check`:
  - budget на размер instructions и вспомогательного контекста;
  - budget на input images и structured-output;
  - budget на write-set, который может быть применён к пользовательскому workspace.
- При превышении budget action-path должен завершаться явной bounded ошибкой до того, как expensive path создаст избыточную нагрузку или частично применит результат.
- Change должен сохранить retriable и объяснимый user-facing контракт: отказ по budget не маскируется под «обычную provider/network ошибку».

## Non-goals

- Не менять модельные стратегии, prompt semantics или product guidance уровня.
- Не вводить provider-specific billing/rate policies.
- Не заниматься очередями task actions: это отдельный runtime change.

## Capabilities

### Modified Capabilities

- `llm`: user-facing LLM flows получают bounded payload contract.
- `task`: task runtime не должен применять чрезмерный write-set без явной budget-проверки.
- `iteration`: `start`, `iterate` и `check` сохраняют смысл, но получают явные границы на expensive input/output path.

## Acceptance Criteria

- Для `start`, `iterate` и `check` определены и реализованы budgets на expensive input/output path.
- Runtime умеет отклонять oversized instruction/output/write-set до частичного применения побочных эффектов.
- Budget-error отличается от обычной provider/network ошибки и остаётся retriable только после уменьшения нагрузки/входа.
- В tasks зафиксированы unit-проверки и traceability для bounded LLM/runtime contract.
