## Why

`producer-architecture-transform` уже зафиксировал, что текущий lab runtime является foundation-слоем для следующих архитектурных waves. Но один только producer не даёт тактического контура, по которому можно доводить runtime-hardening changes до закрытия и не путать их с event, packaging или workbench линиями.

Нужен отдельный dispatcher, который:

- держит operational backlog для runtime-hardening changes;
- подчиняет эти changes общей архитектурной линии `focus-tech`;
- явно отделяет lab runtime foundation от соседних dispatcher-направлений;
- позволяет закрывать implement/fix changes этой линии без ложной привязки к `dataflow`.

## What Changes

- Вводится `dispatcher-runtime` как тактический dispatcher архитектурной линии укрепления lab runtime.
- Dispatcher фиксирует:
  - что `implement-lab-runtime-contract-hardening` относится к runtime-foundation lane;
  - что downstream runtime cleanup/fix changes должны ссылаться на `dispatcher-runtime`, если они укрепляют lab action/service/mutation boundaries;
  - что producer-контекст для этой линии задаётся `producer-architecture-transform`.
- `implement-lab-runtime-contract-hardening` перепривязывается к `dispatcher-runtime`.

## Non-goals

- Не заменяет `producer-architecture-transform` и не дублирует его roadmap.
- Не подменяет dispatcher для `dataflow`, `packaging` или `log-system`.
- Не добавляет новый runtime behavior сам по себе.

## Capabilities

### Modified Capabilities

- `architecture-roadmap`: у runtime-foundation line появляется отдельный tactical dispatcher.
- `testing-layer`: runtime-hardening changes остаются обязаны иметь понятный verification layer и команды запуска.

## Impact

- `focus-tech` получает отдельный tactical dispatcher для lab runtime foundation вместо ложной привязки runtime-line к соседним technical lanes.
- Downstream runtime-hardening changes получают корректного родителя без расширения product scope и без смены стратегического контекста.

## Acceptance Criteria

- `dispatcher-runtime` отображается в дереве OpenSpec как дочерний change у `focus-tech`.
- `implement-lab-runtime-contract-hardening` ссылается на `dispatcher-runtime`, а не на несвязанный dispatcher.
- Producer и dispatcher не конфликтуют: стратегический порядок задаёт `producer-architecture-transform`, tactical ownership runtime-line задаёт `dispatcher-runtime`.
- `dispatcher-runtime` достаточно описан, чтобы быть валидным родителем для runtime-hardening implement/fix changes.
