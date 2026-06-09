## Tasks

- [ ] 1. Зафиксировать `dispatcher-docs` как tactical owner governance-документации под `focus-governance`.
- [ ] 2. Явно развести ownership между `dispatcher-docs`, `dispatcher-doc` и `dispatcher-openspec`.
- [ ] 3. Определить классы downstream changes для process-documentation drift, handoff-guidance и traceability-docs.
- [ ] 4. Подготовить dispatcher к маршрутизации downstream changes по governance/OpenSpec-документации.
- [ ] 5. Поддерживать handoff и карту активных child changes этой линии в состоянии, пригодном для внешней проверки.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `admin-tools`: governance-документация внутренних команд получает отдельного tactical owner.
- `testing-layer`: process-docs changes обязаны удерживать читаемый verification и traceability-контур.

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
- Не требуются: change описывает ownership и маршрутизацию governance-документации.

Отложенное покрытие:
- Не требуется: change не вводит новый runtime-контракт и ограничен governance-артефактами OpenSpec.
