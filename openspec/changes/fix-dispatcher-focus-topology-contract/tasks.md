## Tasks

- [x] 1. Зафиксировать в системных правилах topology `focus -> dispatcher`, а не `producer -> dispatcher`.
- [x] 2. Обновить active contract `admin-tools` под модель конструктивной конкуренции producer и dispatcher.
- [x] 3. Обновить traceability/tooling:
  - [x] 3.1 запретить `parent_change` dispatcher на producer;
  - [x] 3.2 разрешить producer roadmap для dispatcher в той же focus-орбите;
  - [x] 3.3 убрать из user-facing guidance объяснение dispatcher как child producer-а.
- [x] 4. Синхронизировать unit tests governance-слоя с новой topology.
- [x] 5. Обновить active planning texts, где старая модель уже зашита явно.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `admin-tools`: producer и dispatcher работают в одной focus-линии без ложного parentage.
- `admin-tools`: dispatcher подчиняется focus напрямую.
- `admin-tools`: dispatcher не может хранить `producer_ref`.
- `admin-tools`: dispatcher наследует roadmap стратегических owners той же focus-орбиты.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`

Mock/fixture-данные и credentials:
- Нужны только локальные временные OpenSpec fixtures для unit-тестов.
- Live credentials не требуются.
