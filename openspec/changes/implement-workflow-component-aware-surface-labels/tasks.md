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

Затронутые OpenSpec capability/scenarios:
- `workflow`: "Пользователь видит компонент проекта внутри workflow-сессии"
- `projects`: "Пользователь видит компонент проекта внутри workbench summary"
- `projects`: "Пользователь видит компонент проекта в списке workflow-сессий"

Уровень проверки:
- unit

Команда проверки:
- `npx vitest run --project unit test/unit/workflow-component-aware-surface-labels.test.ts test/unit/project-component-registry-surface.test.ts test/unit/workbench-workflow-session-surface.test.ts`

Mock/fixture-данные и live credentials:
- Достаточно unit-level фикстур для resolver-а `workflow-session -> ProjectComponent` и source-contract проверок surface-текстов.
- Live credentials не требуются.
