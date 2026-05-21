## Why

Нужна релизная метка для потока работ на 21 мая 2026, чтобы отделить его от других параллельных инициатив.

## What Changes

- Создан release change `release-2026-05-21-day`.
- В этот релиз включена первая MVP-волна событийной линии:
  - `implement-event-envelope-contract`
  - `implement-screen-event-envelope-propagation`
  - `implement-log-system-runtime-boundary`
  - `implement-event-envelope-test-harness`
  - `implement-event-envelope-docs`

## Impact

- Повышается прозрачность релизного состава.
- Иерархия `parent_change` не меняется, release используется только как метка.
