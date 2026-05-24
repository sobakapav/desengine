## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить промежуточную проверку целевых unit-тестов по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки: unit
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки: `npm run test:unit -- test/unit/task-screen-data.test.ts` и `npm run test:unit -- test/unit/p1-source-contracts.test.ts`
- [x] Описать mock/fixture-данные и live credentials, если нужны: live credentials не нужны; используются unit-mocks для `@/lib/onboarding/repository` и `@/lib/task/data`
