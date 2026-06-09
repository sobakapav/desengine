## Why

Текущий task runtime уже умеет последовательно выполнять мутации по одному `taskId`, но эта защита решает только проблему конфликтов, а не проблему нагрузки. Сейчас в `runTaskMutation` нет явного budget-контракта:

- у очереди мутаций нет лимита длины;
- у runtime нет общей защиты от накопления слишком большого числа pending actions;
- repeated `start` / `iterate` / `check` / `save` / `reset` могут не блокировать друг друга достаточно рано и копить pending-нагрузку на машину пользователя.

Для `npm run start` этого уже недостаточно. Если пользователь открывает несколько вкладок, быстро повторяет действия или долго держит зависшие action-path'ы, система должна не просто сериализовать их, а уметь ограничивать избыточную нагрузку.

## What Changes

- Вводится implement-change `implement-runtime-task-load-guardrails` под `dispatcher-runtime`.
- Change должен ввести runtime guardrail'ы для task action lane:
  - budget на длину per-task очереди;
  - budget на число одновременно удерживаемых pending mutation contexts;
  - fast-fail path для overload-состояния вместо бесконечного накапливания ожидания.
- Guardrail'ы должны применяться к user-facing action-path'ам:
  - `start`;
  - `iterate`;
  - `check`;
  - `save files`;
  - `reset`.
- Change должен явно зафиксировать, как overload отражается в пользовательском и server-runtime контракте: ретраибельная ошибка, отсутствие частично применённой мутации, отсутствие silent queue growth.

## Non-goals

- Не менять product semantics самих task actions.
- Не решать preview payload performance: это Workbench-линия.
- Не вводить provider-specific rate limiting или модельные budgets: это отдельный LLM-path.

## Capabilities

### Modified Capabilities

- `task`: task action runtime получает bounded queue/load contract.
- `iteration`: `start`, `iterate` и `check` должны оставаться retriable и не перегружать машину пользователя бесконечной очередью.
- `level-labs`: лаборатория должна переживать overload task-actions без неконсистентного user state.

## Acceptance Criteria

- Per-task mutation queue имеет явный upper bound вместо неограниченного накопления pending actions.
- Runtime имеет защиту от чрезмерного числа одновременно удерживаемых action contexts.
- При overload user-facing actions завершаются явной retriable ошибкой без частично применённой мутации.
- В tasks зафиксированы unit-проверки и traceability для нового guardrail-контракта.
