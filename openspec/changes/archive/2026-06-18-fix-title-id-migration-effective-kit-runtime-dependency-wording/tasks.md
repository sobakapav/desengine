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
- `projects`: "Пользователь открывает config проекта"
- `projects`: "Пользователь редактирует title и id проекта"
- `projects`: "Пользователь видит, где хранится проект"
- `projects`: "Пользователь создаёт компонент внутри проекта"
- `workflow`: "Пользователь запускает workflow из компонента проекта"
- `storage-adapter`: "Storage backend ещё локальный"

Уровень проверки:
- unit

Команда проверки:
- `npx vitest run --project unit test/unit/project-user-surface-foundation.test.ts test/unit/project-config-and-ui-kit-contract.test.ts test/unit/project-component-registry-surface.test.ts test/unit/check-prompt-context.test.ts test/unit/project-history-diagnostics-surface.test.ts test/unit/architecture-transform-project-facing.test.ts`
- `npm run test:traceability`

Mock/fixture-данные и live credentials:
- Достаточно unit-level фикстур для project registry, project config, prompt context и component entrypoint.
- Live credentials не требуются.

Результат внешней проверки:
- Независимый verification-agent подтвердил `24/24` unit-теста зелёными.
- `npm run test:traceability` завершился сообщением `Traceability metadata is valid`.
