## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

### Затронутые OpenSpec capability/scenarios

- `workflow`: workflow-point становится управляющим механизмом generation.
- `task`: start/iterate service boundary получает target file set выбранного пункта.

### Уровень проверки

- unit

### Команда проверки

- `npx vitest run --project unit test/unit/task-actions-boundary.test.ts`

### Mock/fixture-данные и credentials

- Используются unit mocks task/runtime boundary.
- Live credentials не нужны.
