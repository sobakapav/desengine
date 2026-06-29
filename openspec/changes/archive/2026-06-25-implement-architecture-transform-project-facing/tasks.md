## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Добавить architecture-transform panel/model в project overview.
- [x] 3. Синхронизировать active OpenSpec и traceability под новый user-facing слой.
- [x] 4. Подготовить change к внешней проверке без самостоятельного финального прогона.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `architecture-transform`: architecture line проявляется на странице проекта как user-facing панель.
- `projects`: project overview остаётся точкой входа для project-facing слоёв без отдельного workbench flow.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен.
- component/browser: не обязателен для первого среза.
- integration: не обязателен в этой волне.
- e2e smoke: не обязателен в этой волне.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- project-user-surface-foundation architecture-transform-project-facing`

Mock/fixture-данные и credentials:
- используются локальные project/workflow/history snapshots без live backend;
- live credentials не нужны.
