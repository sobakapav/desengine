## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `external-local-onboarding` / `Пользователь проходит новую установку по шаблонной конфигурации`, `testing-layer` / `Добавляется новый behavior-change`
- [x] Выбрать уровень проверки: unit + static/contract source assertions
- [x] Добавить или обновить тесты: `test/unit/p2-source-contracts.test.ts`
- [x] Зафиксировать команду проверки: `npm run test:unit -- test/unit/p2-source-contracts.test.ts`
- [x] Описать mock/fixture-данные и live credentials, если нужны: не требуются, проверка читает только repo sources
