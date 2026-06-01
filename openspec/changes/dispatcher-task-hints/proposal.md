## Why

Линия task hints уже стала отдельной осью поведения onboarding: для неё есть roadmap, действующие spec-контракты и как минимум один архивный implement change. Без отдельного dispatcher эта линия быстро расползается между точечными реализациями и исправлениями, а её границы приходится каждый раз собирать заново.

Нужен активный change, который удерживает:

- где проходит граница task hints относительно prompts, help и общего onboarding UX;
- какие capability/spec отвечают за runtime-контракт подсказок;
- какие downstream `implement` и `fix` changes относятся к этой линии;
- какую тестовую опору обязан иметь каждый behavior-change, меняющий подсказки задач.

## What Changes

`dispatcher-task-hints` закрепляется как родительский planning change под `focus-onboarding` для всей линии task hints.

Dispatcher фиксирует:

- продуктовые границы линии: статичные и шаблонные task hints, их связь с task/workbench context и миграцией без дублирования prompt-layer решений;
- место runtime-контрактов: наблюдаемое поведение живёт в capability `task`, общий template context boundary живёт в capability `prompt-context`;
- downstream changes этой линии: concrete runtime-изменения оформляются отдельными `implement`/`fix` changes с собственными `release_ref` и verification strategy;
- тестовую политику: каждый behavior-change по task hints обязан явно указывать capability/scenarios, уровень проверки, команды запуска, fixtures и traceability.

## Non-goals

- Самостоятельно вносить runtime-изменения в продукт без downstream child change.
- Подменять собой действующие `implement`/`fix` changes этой линии.
- Менять шаблонный движок, install-critical стек или UX-поток onboarding.

## Capabilities

### New Capabilities

- Нет.

### Modified Capabilities

- Прямых delta-spec нет: `dispatcher-task-hints` не меняет пользовательский контракт сам по себе, а удерживает стратегический и тактический контур вокруг capability `task` и `prompt-context`, где фиксируется наблюдаемое поведение task hints.

## Impact

- Иерархия OpenSpec changes вокруг линии task hints под `focus-onboarding`.
- Координация между roadmap [focus-onboarding/roadmaps/task-hints.md](/Users/op/dev/sobakapav/desengine/openspec/changes/focus-onboarding/roadmaps/task-hints.md), действующими spec и downstream changes.
- Требование держать runtime-изменения task hints в явной связи с тестовым слоем и release-трассировкой.

## Acceptance Criteria

- `dispatcher-task-hints` остаётся активным родительским change для task-hints линии под `focus-onboarding`.
- Change явно ссылается на roadmap task hints и на capability, где живут runtime-контракты этой линии.
- Concrete runtime-изменения и регрессии task hints оформляются как child `implement`/`fix` changes этого dispatcher, а не как несвязанные инициативы.
- Для каждого child behavior-change требуется человеко-понятная тестовая часть с capability/scenarios, уровнями проверки, командами, fixture/live assumptions и traceability.
