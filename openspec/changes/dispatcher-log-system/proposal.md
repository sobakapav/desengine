## Why

Наряду с общим `EventEnvelope` нужен отдельный управляющий контур для самого продуктового журнала событий. Даже если storage и downstream integration пока не планируются, уже сейчас важно развести:

- форму события;
- систему журналирования, в которой такие события живут;
- будущие правила lifecycle, export/delete и local-first хранения.

Без этого следующий implement wave легко смешает event contract и log-system в одну неясную конструкцию.

## What Changes

- Вводится `dispatcher-log-system` как управляющий change для системы журналирования продуктовых событий.
- Dispatcher фиксирует:
  - роль product event log как отдельного слоя;
  - границы будущего local-first log system;
  - разделение между log-system и downstream consumers;
  - roadmap на будущие implement/storage changes.
- Dispatcher не запускает storage-реализацию, а задаёт её архитектурные рамки.

## Non-goals

- Не реализует storage adapter, append-only store или export/delete в коде.
- Не проектирует телеметрию, аналитику или облачную доставку событий.
- Не подменяет собой `dispatcher-event-envelope`.
- Не привязывает систему к тяжёлому стеку и внешним брокерам.

## Capabilities

### Modified Capabilities

- `event-envelope`: общий контракт получает отдельную лог-системную орбиту внедрения.
- `projects`: будущий product event log должен поддерживать project-scoped lifecycle.
- `testing-layer`: будущие implement changes по log-system обязаны иметь traceability и тестовую часть.

## Acceptance Criteria

- `dispatcher-log-system` отображается в дереве OpenSpec как дочерний change у `focus-tech`.
- Producer-контекст `producer-event-envelope-experience-cost-boundary` сохранён через `producer_ref`, а не через прямое родительство.
- Зафиксирована роль product event log отдельно от event contract и downstream payload profiles.
- Зафиксированы рамки будущих storage/lifecycle changes без преждевременной реализации.
- Есть roadmap на последующие implement changes по log-system.
