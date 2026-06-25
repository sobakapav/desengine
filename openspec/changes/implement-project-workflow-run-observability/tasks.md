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

- `projects`: проект показывает workflow-run как наблюдаемый слой.
- `workflow`: пользователь видит project-aware artifacts и bindings как часть run surface.

### Уровень проверки

- unit

### Команда проверки

- `npx vitest run --project unit test/unit/project-workflow-readout-surface.test.ts`

### Mock/fixture-данные и credentials

- Используются unit fixtures и source-contract проверки.
- Live credentials не нужны.
