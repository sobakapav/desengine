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

- `workflow`: selected workflow point становится частью production guidance.
- `task`: task-specific подсказка и service boundary учитывают workflow focus.
- `prompt-context`: canonical PromptContext включает workflow-point focus.

### Уровень проверки

- unit
- integration

### Команда проверки

- `npx vitest run --project unit test/unit/task-hints.test.ts test/unit/check-prompt-context.test.ts test/unit/prompt-context-runtime-boundary.test.ts test/unit/task-project-client-boundary.test.ts`
- `npx vitest run --project integration test/integration/task-routes.test.ts`

### Mock/fixture-данные и credentials

- Используются локальные unit/integration fixture и `vi.mock`.
- Live credentials не нужны.
