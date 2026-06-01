## Why

`producer-event-envelope-experience-cost-boundary` зафиксировал проблему: `experience`, `user-action-log` и `cost-accounting` нельзя пускать в реализацию как три независимые event-модели без общей технической линии передачи данных.

Нужен отдельный dispatcher, который переведёт это исследование в управляемую линию внедрения: удержит технический dataflow-контур, закрепит общий контракт события, propagation-границы и не даст downstream changes разойтись по форме данных, scope и payload-правилам.

## What Changes

- Вводится `dispatcher-dataflow` как управляющий change для технического контура продуктовых dataflow.
- Dispatcher фиксирует:
  - обязательное ядро `EventEnvelope` как одной из форм dataflow-контракта;
  - границы между envelope и payload profiles;
  - scope-инварианты для `project` / `task` / `workflow step` / `workbench`;
  - propagation-границы между runtime-слоями;
  - список downstream changes, которые обязаны использовать общий dataflow-contract.
- Dispatcher отделяет dataflow-контур от вопросов storage, retention и lifecycle event log.

## Non-goals

- Не реализует runtime-запись событий и не добавляет storage.
- Не проектирует downstream payload во всех деталях реализации.
- Не подменяет собой `dispatcher-log-system`.
- Не вводит телеметрию, event bus или тяжёлую event-driven платформу.

## Capabilities

### Modified Capabilities

- `event-envelope`: общий контракт событий получает отдельный управляющий dispatcher.
- `dataflow`: технический контур движения продуктовых данных получает отдельный управляющий dispatcher.
- `experience`: будущие события опыта обязаны использовать общий envelope.
- `cost-accounting`: будущие cost events обязаны использовать общий envelope.
- `user-action-log`: будущие action events обязаны использовать общий envelope.

## Acceptance Criteria

- `dispatcher-dataflow` отображается в дереве OpenSpec как дочерний change у `focus-tech`.
- Producer `producer-event-envelope-experience-cost-boundary` остаётся отдельным стратегическим контекстом и не становится родителем или metadata-меткой dispatcher.
- Зафиксированы обязательные поля общего envelope и правила, что может жить только в payload.
- Зафиксирована карта downstream changes, которые должны использовать общий dataflow-contract.
- В первой implement-волне у dispatcher есть не только foundation-контракт, но и наблюдаемый runtime-step screen propagation.
- Dispatcher явно разводит зону ответственности `dataflow` и `log-system`.
