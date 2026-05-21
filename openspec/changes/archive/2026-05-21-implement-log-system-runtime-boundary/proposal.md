## Why

После появления кодового `EventEnvelope` и наблюдаемого screen-level propagation нужен отдельный минимальный шаг для записи продуктовых событий: один жёстко зафиксированный runtime entrypoint. До появления storage и реальных producers системе нужен не «почти log-system», а только узкая boundary, через которую следующие changes смогут зависеть от одного контракта.

Иначе downstream changes начнут добавлять ad-hoc запись в разных местах, и к моменту появления настоящего log-system придётся разбирать несколько конкурирующих точек входа.

## What Changes

- Вводится один runtime entrypoint для product event log: `recordEvent` или его прямой эквивалент.
- Вводится один лёгкий adapter для log sink:
  - без persistent storage;
  - без очередей, брокеров и producer wiring;
  - без дополнительных runtime-режимов сверх базового no-op/stub sink.
- Boundary принимает только валидный `EventEnvelope`.
- Change не расширяет пользовательские flow и не добавляет новые продуктовые сценарии. Его цель только в фиксации runtime-boundary.

## Non-goals

- Не реализуем persistent storage.
- Не добавляем `in-memory` хранилище как отдельную форму runtime storage.
- Не подключаем облачную доставку, брокеры, очереди и телеметрию.
- Не подключаем producers и не делаем wiring продуктовых источников событий.
- Не делаем event replay, projections или аналитику.
- Не внедряем запись событий в пользовательские runtime-paths продукта.
- Не создаём второй публичный или полупубличный способ записи product event log.

## Capabilities

### Modified Capabilities

- `event-envelope`: общий контракт получает единый runtime-entrypoint.
- `projects`: будущий log-system получает одну project-scoped boundary вместо нескольких ad-hoc точек записи.
- `testing-layer`: появляется проверяемый runtime contract для product event log без storage и live credentials.

## Acceptance Criteria

- В коде есть ровно один runtime-boundary для записи продуктовых событий.
- Boundary зависит от общего `EventEnvelope`, а не от доменно-частных ad-hoc shape.
- Есть один default stub/no-op adapter, который не требует storage и внешних зависимостей.
- Нет producer wiring, storage implementation и расширения пользовательских flow.
- Есть unit/service tests на запись валидного события, отказ на невалидном входе и использование default adapter.
- В кодовой базе нет параллельного второго общего entrypoint для product event log.

## Proof Of Value

Первый заход считается полезным, если он даёт все три свойства одновременно:

- любой следующий change, которому нужно «записать product event», зависит от одного runtime entrypoint, а не изобретает свой;
- boundary уже можно проверить unit/service тестами без storage, live credentials и пользовательских flow;
- отсутствие storage и producer wiring не мешает доказать, что контракт записи событий зафиксирован и не размножается.
