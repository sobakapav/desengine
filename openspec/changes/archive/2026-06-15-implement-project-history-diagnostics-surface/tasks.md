## Tasks

- [x] 1. Зафиксировать user-facing contract project history и diagnostics.
- [x] 2. Реализовать project history surface:
  - [x] 2.1 показать prompt history и check results;
  - [x] 2.2 показать reset snapshots и migration status;
  - [x] 2.3 показать project-scoped рабочий след без сырого файлового браузера.
- [x] 3. Обновить OpenSpec delta для capability `projects`.
- [x] 4. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: пользователь видит project-scoped историю и диагностику.
- `task`: project history объясняет след task runtime внутри проекта.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для adapters/history selectors.
- component/browser: обязателен, если появится интерактивный history/diagnostics UI.
- integration: не обязателен, если реализация остаётся внутри current project/runtime boundaries.
- e2e smoke: по необходимости.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <project-history-diagnostics-tests>`

Mock/fixture-данные и credentials:
- fixtures должны включать prompt history, check results, reset snapshots и migration status;
- live credentials не нужны.
