## Context

Моя предыдущая combined-ветка смешивала task layer и workbench semantics. После обновления `producer-project` это уже неправильная декомпозиция: producer прямо требует сначала foundation, потом onboarding/task, затем workflow как отдельный процессный слой, и только потом `workbench` / preview binding.

Это изменение также должно уважать ограничения `producer-architecture-transform`: `сессия работы` не выделяется в отдельный слой. Значит, workbench-binding нужно описывать аккуратно: как project-scoped semantics рабочего места, не превращая этот change в owner workflow-механики.

## Goals

- Сделать workbench и preview semantics явной частью project contract.
- Не переоткрывать task-layer, already handled separate change.
- Не забирать ownership у отдельного workflow-change.

## Non-goals

- Не решать в этой ветке invalidation прогресса.
- Не переносить сюда foundation project entity.
- Не описывать здесь workflow как основной объект change.

## Decisions

1. `workbench` / preview binding оформляется отдельным implement change после task layer и workflow layer.

2. Preview semantics зависят от `project.settings` как части project contract, а не как локального переключателя UI.

3. Этот change отвечает только за workbench/preview semantics и project-aware lab flow.

## Risks / Trade-offs

- Если опять смешать task-layer и workbench semantics, первая project-wave потеряет проверяемость.
  -> Mitigation: отдельная implement-ветка под workbench/preview binding.

- Если сюда снова затянуть workflow ownership, change начнёт спорить с отдельной process-layer веткой.
  -> Mitigation: оставить в этом change только workbench/preview semantics и их зависимость от project contract.

## Open Questions

- Какие части текущего lab UX обязаны стать явно project-scoped уже в первой workbench-ветке.
- Нужен ли отдельный follow-up на многосессионность рабочего места после этой волны.
