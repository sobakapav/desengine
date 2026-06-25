## Why

Система задач уже стала отдельной осью поведения onboarding: у неё есть task catalog, уровни, рабочий экран, прогресс, task-specific guidance и растущий набор downstream changes. Без отдельного dispatcher эта область быстро расползается между точечными реализациями и исправлениями, а её границы приходится каждый раз собирать заново.

Нужен активный change, который удерживает:

- где проходит граница task-системы относительно prompts, общих onboarding flows и соседних product-линий;
- какие capability/spec отвечают за runtime-контракт задач, task metadata, уровней, progress и guidance;
- какие downstream `implement` и `fix` changes относятся к task-системе;
- какую тестовую опору обязан иметь каждый behavior-change, меняющий поведение задач.

## What Changes

`dispatcher-tasks` закрепляется как родительский planning change под `focus-onboarding` для всей системы задач онбординга.

Dispatcher фиксирует:

- продуктовые границы линии: task catalog, task metadata, task/workbench flows, уровни, task hints и другие user-facing task surfaces;
- migration task-системы в проектный и workflow режимы, если это меняет саму структуру onboarding-задач и их user-facing path;
- место runtime-контрактов: основное наблюдаемое поведение живёт в capability `task`, а смежные контракты фиксируются в связанных capability, например `prompt-context`, когда task system реально использует общий template context;
- downstream changes этой линии: concrete runtime-изменения оформляются отдельными `implement`/`fix` changes с собственными `release_ref` и verification strategy;
- тестовую политику: каждый behavior-change по task-системе обязан явно указывать capability/scenarios, уровень проверки, команды запуска, fixtures и traceability.

## Non-goals

- Самостоятельно вносить runtime-изменения в продукт без downstream child change.
- Подменять собой действующие `implement`/`fix` changes этой линии.
- Менять install-critical стек или переписывать весь onboarding UX вне task-контура.

## Capabilities

### New Capabilities

- Нет.

### Modified Capabilities

- Прямых delta-spec нет: `dispatcher-tasks` не меняет пользовательский контракт сам по себе, а удерживает стратегический и тактический контур вокруг capability `task` и смежных capability, где фиксируется наблюдаемое поведение системы задач.

## Impact

- Иерархия OpenSpec changes вокруг task-системы под `focus-onboarding`.
- Координация между roadmap [focus-onboarding/roadmaps/tasks.md](/home/op/dev/sobakapav/desengine/openspec/changes/focus-onboarding/roadmaps/tasks.md), действующими spec и downstream changes.
- Требование держать runtime-изменения task-системы в явной связи с тестовым слоем и release-трассировкой.

## Acceptance Criteria

- `dispatcher-tasks` остаётся активным родительским change для task-системы под `focus-onboarding`.
- Change явно ссылается на roadmap задач онбординга и на capability, где живут runtime-контракты этой линии.
- Concrete runtime-изменения и регрессии task-системы оформляются как child `implement`/`fix` changes этого dispatcher, а не как несвязанные инициативы.
- Для каждого child behavior-change требуется человеко-понятная тестовая часть с capability/scenarios, уровнями проверки, командами, fixture/live assumptions и traceability.
