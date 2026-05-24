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

Затронутые capability/scenarios:
- `level-labs` — `Система читает level-config уровня`, `Система показывает общее пояснение уровня пользователю`
- `component-file-set` — `Пользователь открывает форму уточняющего промпта`

Уровень проверки:
- `unit`

Команда проверки:
- `npm run test:unit -- test/unit/onboarding-prompt-templates.test.ts test/unit/p1-source-contracts.test.ts`

Mock/fixture/live:
- Дополнительные mock/fixture-данные и live credentials не требуются; проверка читает versioned onboarding-файлы из репозитория.
