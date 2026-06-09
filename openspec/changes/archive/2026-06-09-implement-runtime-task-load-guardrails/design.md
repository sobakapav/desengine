## Context

`dispatcher-runtime` отвечает за runtime boundary, service flow и mutation lane лаборатории. В коде уже есть per-task сериализация через `runTaskMutation`, но она пока не является полноценно bounded:

- очередь на `taskId` логически бесконечна;
- глобальный pressure от нескольких `taskId` не ограничен;
- user-facing runtime пока лучше защищён от конфликтов, чем от перегруза.

Это означает, что при неблагоприятном поведении пользователя система может оставаться формально последовательной, но всё равно перегружать CPU/RAM ожиданием и накопленными runtime contexts.

## Goals

- Превратить task mutation boundary из «просто последовательной» в bounded и pressure-aware.
- Защитить машину пользователя от неограниченного накопления action backlog.
- Сохранить retry-friendly пользовательский контракт без silent data corruption.

## Non-goals

- Не пересматривать UX всей лаборатории.
- Не менять архитектуру preview или prompt-building.
- Не внедрять внешнюю очередь, брокер или отдельную инфраструктуру исполнения.

## Decisions

1. Перегруз надо отсекать до накопления большого backlog.
   - Система не должна бесконечно обещать «сейчас выполню», если очередь уже стала вредной для машины пользователя.

2. Guardrail должен быть и per-task, и process-level.
   - Только per-task лимита недостаточно: пользователь может перегрузить процесс через несколько задач или вкладок.

3. Overload path должен быть retriable и side-effect safe.
   - Перегруженное действие должно явно завершаться как отказ в постановке, а не как partially queued mutation.

4. Guardrail реализуется двумя явными budget'ами.
   - `runTaskMutation` ограничивает backlog одной задачи максимум двумя ожидающими mutation contexts сверх активной мутации.
   - Runtime ограничивает общее число удерживаемых pending mutation contexts значением `8`.

5. Fast-fail overload публикуется как канонический runtime contract.
   - Refusal возвращает `503` с `errorKind=overload`, `retryable=true` и `retryAfterMs=1000`.
   - Runtime diagnostics фиксирует отказ в `mutation_boundary/task_mutation_refused` с reason `task_mutation_overload`.

## Risks / Trade-offs

- Слишком маленькие лимиты ухудшат UX и дадут ложные overload-error.
- Слишком большие лимиты защитят от конфликтов, но не от реальной machine-level нагрузки.
- Придётся отделить «действие уже выполняется» от «очередь уже вредна», чтобы не запутать contract.

## Open Questions

- Нужны ли разные лимиты для `save files` и для более дорогих LLM actions.
- Нужно ли в этом же change сохранять diagnostic counters для последующего анализа producer-speed-and-load.
