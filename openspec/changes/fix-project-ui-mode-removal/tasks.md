## Tasks

- [x] 1. Убрать `uiMode` из canonical project contract и migration payloads.
- [x] 2. Упростить runtime/prompt/preview/API слой до единственного `uiKitId`.
- [x] 3. Убрать `uiMode` из project-facing UI и client payloads.
- [x] 4. Синхронизировать active OpenSpec и runnable/source-contract tests.
- [x] 5. Подготовить change к внешней проверке без самостоятельного финального прогона.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `projects`: project config и project overview больше не показывают `uiMode`.
- `storage-adapter`: project storage и project-facing runtime больше не принимают и не прокидывают `uiMode`.
- `workflow`: project-aware workflow/prompt context больше не содержит mode-ветвления.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен.
- component/browser: не обязателен для этого fix.
- integration: по необходимости для route-contract.
- e2e smoke: не обязателен в этой волне.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- project-ui-kit-switching project-config-and-ui-kit-contract project-user-surface-foundation`

Mock/fixture-данные и credentials:
- используются существующие project fixtures с `uiKitId`;
- `uiMode` удаляется из fixture payloads;
- live credentials не нужны.
