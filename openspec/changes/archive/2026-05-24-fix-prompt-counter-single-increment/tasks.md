## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить промежуточную unit-самопроверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые capability/scenarios:
- `iteration` / `Пользователь смотрит на историю уточняющих промптов`

Уровень проверки:
- `unit`

Команды проверки:
- `npm run test:unit -- test/unit/task-server-runtime-mutations.test.ts`
- `npm run test:unit -- test/unit/task-progress-summary.test.ts`

Mock/fixture-данные и credentials:
- Используются unit-mocks для `prompt-history`, progress-store и level catalog; live credentials не нужны.
