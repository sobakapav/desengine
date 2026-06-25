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
- `projects`: "Пользователь создаёт новый проект из project registry"
- `projects`: "Пользователь видит список компонентов проекта"
- `projects`: "Пользователь создаёт компонент внутри проекта"

Уровень проверки:
- unit

Команда проверки:
- `npx vitest run --project unit test/unit/project-component-registry-surface.test.ts test/unit/project-user-surface-foundation.test.ts`

Mock/fixture-данные и live credentials:
- Достаточно unit-level фикстур для project и project-component registry.
- Live credentials не требуются.
