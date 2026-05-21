## Tasks

- [x] 1. Выбрать канонические документационные точки входа для MVP event-линии (`README.md`, `docs/**`, профильный developer doc).
- [x] 2. Описать foundation-слой:
  - [x] 2.1 общий `EventEnvelope`
  - [x] 2.2 runtime-boundary записи события
- [x] 3. Описать наблюдаемый MVP flow:
  - [x] 3.1 `page.tsx` собирает screen event
  - [x] 3.2 `Screen` передаёт event потомкам
  - [x] 3.3 потомки наблюдают обновление события
- [x] 4. Явно перечислить deferred-части MVP:
  - [x] 4.1 storage
  - [x] 4.2 analytics/cost/experience producers
  - [x] 4.3 расширение propagation за пределы MVP-screen flow
- [x] 5. Согласовать документацию с тестовым контуром и traceability-командами.
- [x] 6. Подготовить change к внешней проверке через документационный diff и `npm run test:traceability`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `docs`: event-линия получает отдельное документационное сопровождение.
- `event-envelope`: документация описывает общий контракт и наблюдаемый MVP-flow.
- `testing-layer`: документация синхронизирована с командами проверки и traceability-ожиданиями.

Уровни проверки:
- static/contract: обязательный.
- unit: внешний контроль синхронизации с уже реализованным MVP foundation/runtime-flow.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change документирует уже описанное MVP-поведение и опирается на существующие unit/traceability-проверки.
