## Why

`producer-event-envelope-experience-cost-boundary` зафиксировал проблему: `experience`, `user-action-log` и `cost-accounting` нельзя пускать в реализацию как три независимые event-модели.

Нужен отдельный dispatcher, который переведёт это исследование в управляемую линию внедрения: определит общий контракт события, закрепит его границы и не даст downstream changes разойтись по форме события, scope и payload-правилам.

## What Changes

- Вводится `dispatcher-event-envelope` как управляющий change для общего продуктового event contract.
- Dispatcher фиксирует:
  - обязательное ядро `EventEnvelope`;
  - границы между envelope и payload profiles;
  - scope-инварианты для `project` / `task` / `workflow step` / `workbench`;
  - список downstream changes, которые обязаны использовать общий envelope.
- Dispatcher отделяет контракт события от вопросов storage, retention и runtime-потока событий.

## Non-goals

- Не реализует runtime-запись событий и не добавляет storage.
- Не проектирует downstream payload во всех деталях реализации.
- Не подменяет собой `dispatcher-log-system`.
- Не вводит телеметрию, event bus или тяжёлую event-driven платформу.

## Capabilities

### Modified Capabilities

- `event-envelope`: общий контракт событий получает отдельный управляющий dispatcher.
- `experience`: будущие события опыта обязаны использовать общий envelope.
- `cost-accounting`: будущие cost events обязаны использовать общий envelope.
- `user-action-log`: будущие action events обязаны использовать общий envelope.

## Acceptance Criteria

- `dispatcher-event-envelope` отображается в дереве OpenSpec как дочерний change у `focus-tech`.
- Producer-контекст `producer-event-envelope-experience-cost-boundary` сохранён через `producer_ref`, а не через прямое родительство.
- Зафиксированы обязательные поля общего envelope и правила, что может жить только в payload.
- Зафиксирована карта downstream changes, которые должны использовать общий envelope.
- В первой implement-волне у dispatcher есть не только foundation-контракт, но и наблюдаемый runtime-step screen propagation.
- Dispatcher явно разводит зону ответственности `event-envelope` и `log-system`.
