## Tasks

- [x] 1. Зафиксировать user-facing assignment contract между проектом и задачей.
- [x] 2. Реализовать project/task visibility в интерфейсе:
  - [x] 2.1 показать project binding на task surfaces;
  - [x] 2.2 показать задачи проекта на project page;
  - [x] 2.3 добавить project-aware переходы между задачей и проектом.
- [x] 3. Обновить OpenSpec delta для capability `projects` и `task`.
- [x] 4. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: пользователь видит задачи, связанные с проектом.
- `task`: пользователь видит, к какому проекту относится задача.
- `task`: project-aware переходы не теряют project binding в пользовательском flow.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для assignment helpers и project/task page adapters.
- component/browser: обязателен, если реализация меняет task list, task page и project page composition.
- integration: обязателен, если появится отдельный route/API boundary для assignment-модели.
- e2e smoke: по необходимости, если понадобится сквозной сценарий `проект -> задача -> проект`.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- test/unit/project-task-assignment-surface.test.ts`
- `npm run test:integration -- test/integration/task-project-assignment-route.test.ts`
- browser/runtime-команда уточняется в ходе реализации, если change затронет интерактивный переход между pages

Mock/fixture-данные и credentials:
- fixtures должны включать минимум два проекта, несколько задач и разные assignment-связки;
- live credentials не нужны.
