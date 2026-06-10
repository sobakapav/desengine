## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Обновить OpenSpec artifacts change для runnable browser-wrapper fix
- [x] 3. Внести кодовые изменения в browser verification wrapper
- [x] 4. Добавить runnable unit evidence на multi-spec forwarding
- [x] 5. Подготовить change к внешней проверке без самостоятельной финальной browser/e2e верификации

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: `Разработчик запускает browser verification preflight`

Уровни проверки:
- static/contract: обязателен для delta-spec и tasks/handoff bookkeeping change.
- unit: обязателен для CLI/runtime wrapper, который должен сохранять все `.spec.ts` аргументы.
- component/browser: не требуется как локальная проверка исполнителя, потому что этот fix меняет wrapper routing, а финальную browser verification делает внешний проверяющий.
- integration: не требуется.
- e2e smoke: не требуется как локальная обязательная проверка исполнителя.
- live/provider: не требуется.

Команды запуска:
- `npm run test:unit -- test/unit/browser-verification-runtime.test.ts`
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- используются только локальные fixture/contract данные unit-слоя;
- live credentials не нужны;
- поднятие реального browser target server не требуется для локального unit evidence.

## Статус реализации

- Wrapper теперь собирает все переданные `.spec.ts` аргументы и передаёт их в `npm run test:e2e -- ...` одним запуском.
- Локальный unit evidence добавлен в `test/unit/browser-verification-runtime.test.ts`.
- `npm run test:traceability` внутри этого запуска подтвердил `testing-layer: 28/28 scenarios (ready)`, но общий прогон падает на несвязанные `admin-tools` ошибки вне ownership этого fix.
- Финальная внешняя browser/e2e верификация не выполнялась исполнителем.
