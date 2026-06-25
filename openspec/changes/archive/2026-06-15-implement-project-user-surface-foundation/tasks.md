## Tasks

- [x] 1. Добавить project navigation contract:
  - [x] 1.1 ввести helper-ы для `/projects` и `/projects/[projectId]`;
  - [x] 1.2 подключить вкладку `Проекты` в глобальную навигацию.
- [x] 2. Создать user-facing pages project surface:
  - [x] 2.1 страницу списка проектов;
  - [x] 2.2 страницу конкретного проекта;
  - [x] 2.3 базовый project overview с active-project сигналом и metadata.
- [x] 3. Обновить OpenSpec delta для capability `projects`.
- [x] 4. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: пользователь видит раздел проектов в глобальной навигации.
- `projects`: пользователь открывает список проектов как отдельную страницу.
- `projects`: пользователь открывает страницу конкретного проекта.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для navigation helpers и project-page data adapters.
- component/browser: обязателен, если меняется user-facing top navigation или page composition.
- integration: не обязателен, если реализация остаётся в page/navigation слое без отдельного API boundary.
- e2e smoke: по необходимости, если появится отдельный smoke для раздела проектов.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <project-navigation-and-pages-tests>`
- browser/runtime-команда уточняется в ходе реализации, если change затронет интерактивный page-flow

Mock/fixture-данные и credentials:
- fixtures должны включать registry минимум из двух проектов и один active project;
- live credentials не нужны.
