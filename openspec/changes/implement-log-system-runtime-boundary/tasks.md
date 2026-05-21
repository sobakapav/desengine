## Tasks

- [ ] 1. Найти подходящее место для общего runtime-boundary product event log.
- [ ] 2. Реализовать ровно один entrypoint записи события (`recordEvent` или прямой equivalent service).
- [ ] 3. Реализовать adapter contract для log sink.
- [ ] 4. Добавить один default lightweight adapter без storage:
  - [ ] 4.1 `no-op` или `stub` реализация
  - [ ] 4.2 поведение по умолчанию без внешних зависимостей
- [ ] 5. Явно исключить из change:
  - [ ] 5.1 persistent или `in-memory` storage
  - [ ] 5.2 producer wiring
  - [ ] 5.3 расширение пользовательских flow
- [ ] 6. Убедиться, что boundary принимает только общий `EventEnvelope`.
- [ ] 7. Добавить unit/service tests на:
  - [ ] 7.1 запись валидного события
  - [ ] 7.2 отказ на невалидном envelope
  - [ ] 7.3 использование default adapter без storage
  - [ ] 7.4 отсутствие необходимости во втором entrypoint для тестового вызова boundary
- [ ] 8. Обновить traceability foundation-сценариев log-system.
- [ ] 9. Зафиксировать в артефактах change доказательство полезности первого захода:
  - [ ] 9.1 следующий change может использовать готовый entrypoint без перепроектирования boundary
  - [ ] 9.2 проверка возможна без storage, credentials и пользовательских flow
- [ ] 10. Подготовить команды внешней проверки для другого агента: `npm run test:unit` и `npm run test:traceability`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `event-envelope`: запись событий принимает только общий envelope.
- `projects`: log boundary фиксирует одну project-scoped точку записи вместо ad-hoc вариантов.
- foundation-сценарии log-system: единый entrypoint записи события существует без storage, producer wiring и пользовательских flow.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: service-level допустим только как проверка boundary без расширения пользовательского поведения.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды внешней проверки:
- `npm run test:unit`
- `npm run test:traceability`

Доказательство полезности первого захода:
- тесты подтверждают, что валидный `EventEnvelope` проходит через один entrypoint и один default adapter;
- тесты подтверждают, что невалидный вход отвергается без fallback entrypoint;
- traceability показывает, что foundation-сценарий закрывается без storage и без producer wiring.

Mock/fixture-данные и credentials:
- fixture envelope-события;
- stub/no-op sink;
- live credentials не нужны.
