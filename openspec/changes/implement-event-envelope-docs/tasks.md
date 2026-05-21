## Tasks

- [ ] 1. Выбрать канонические документационные точки входа для MVP event-линии (`README.md`, `docs/**`, профильный developer doc).
- [ ] 2. Описать foundation-слой:
  - [ ] 2.1 общий `EventEnvelope`
  - [ ] 2.2 runtime-boundary записи события
- [ ] 3. Описать наблюдаемый MVP flow:
  - [ ] 3.1 `page.tsx` собирает screen event
  - [ ] 3.2 `Screen` передаёт event потомкам
  - [ ] 3.3 потомки наблюдают обновление события
- [ ] 4. Явно перечислить deferred-части MVP:
  - [ ] 4.1 storage
  - [ ] 4.2 analytics/cost/experience producers
  - [ ] 4.3 расширение propagation за пределы MVP-screen flow
- [ ] 5. Согласовать документацию с тестовым контуром и traceability-командами.
- [ ] 6. Подготовить change к внешней проверке через документационный diff и `npm run test:traceability`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `docs`: event-линия получает отдельное документационное сопровождение.
- `event-envelope`: документация описывает общий контракт и наблюдаемый MVP-flow.
- `testing-layer`: документация синхронизирована с командами проверки и traceability-ожиданиями.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется, если change меняет только документацию.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change документирует уже описанное MVP-поведение.
