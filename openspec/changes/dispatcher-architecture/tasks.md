## Tasks

- [x] 1. Зафиксировать `dispatcher-architecture` как tactical owner архитектурной линии.
- [x] 2. Привязать dispatcher к `producer-architecture-transform` и implementation plan producer'а.
- [x] 3. Зафиксировать tactical ownership для ADR, архитектурной карты, словаря сущностей и naming discipline.
- [x] 4. Подготовить dispatcher к маршрутизации downstream changes по модульным границам и контрактам взаимодействия.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `architecture-roadmap`: архитектурная линия получает отдельного tactical owner.
- `openspec-tooling`: ADR и словарь сущностей получают operational ownership.
- `testing-layer`: downstream behavior-change changes обязаны сохранять verification и traceability.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не требуются: change описывает governance и ownership архитектурной линии.
