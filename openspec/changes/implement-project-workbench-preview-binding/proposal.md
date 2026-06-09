## Why

После `ProjectWorkspace`, project-aware onboarding/task layer и отдельного workflow layer система всё ещё не завершает первую project-wave, если `workbench` и preview semantics продолжают жить отдельно от project contract. В таком состоянии проект уже виден в task и workflow flow, но сам рабочий контур пользователя остаётся частично "локальным".

Обновлённый `producer-project` теперь явно выносит `workbench` / preview binding в отдельный шаг после foundation, task и workflow. Это важно и по архитектурной линии: `producer-architecture-transform` требует не смешивать разные boundaries в одну сущность, поэтому workbench-binding должен быть самостоятельным и аккуратным.

## What Changes

- `workbench` начинает читать project contract как обязательную часть входного runtime;
- preview semantics завязываются на `project.settings`, но уже как downstream шаг после foundation, task и workflow;
- лаборатория становится project-scoped рабочим контуром, а не локальным UI-path поверх task-only состояния.

## Non-goals

- Не перепривязывать здесь onboarding/task layer заново.
- Не забирать ownership у отдельного workflow-change.
- Не решать progress invalidation при смене project `UI kit`.
- Не вводить `Project Roadmap` или внешние integrations.

## Capabilities

### Modified Capabilities

- `projects`: project contract реально участвует в workbench/preview semantics.
- `workbench`: workbench-instance и входной контракт верстака становятся project-scoped.
- `level-labs`: лаборатория работает как project-scoped workbench/preview контур.
- `task`: project settings используются как часть preview/workbench contract, а не локального UI-state.

## Acceptance Criteria

- workbench runtime явно знает project contract текущей рабочей сессии;
- preview semantics читают `project.settings` как часть project boundary, а не как ad-hoc local state;
- лаборатория описана как project-scoped рабочий контур;
- тестовая часть change явно фиксирует `static/contract`, `unit`, `integration` и при необходимости browser/e2e слой.
