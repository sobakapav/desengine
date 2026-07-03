## Tasks

- [x] 1. Зафиксировать границы implement-change для первой materialization-волны верстаков:
  - [x] 1.1 Workbench materializes only as generic shell;
  - [x] 1.2 shell belongs to `project`, `workflow` and `subject`;
  - [x] 1.3 shell remains locked and does not open real work.
- [x] 2. Заполнить OpenSpec-артефакты change без плейсхолдеров:
  - [x] 2.1 `proposal.md`;
  - [x] 2.2 `design.md`;
  - [x] 2.3 `handoff.md`;
  - [x] 2.4 `tasks.md`.
- [x] 3. Создать active capability `workbench` и зафиксировать его минимальный контракт.
- [x] 4. Минимально синхронизировать связанные capability:
  - [x] 4.1 `projects` описывает materialized workbench shell как часть project surface;
  - [x] 4.2 `workflow` описывает binding workflow -> workbench shell без task-модели.
- [x] 5. Реализовать product slice в коде:
  - [x] 5.1 foundation contract `ProjectWorkbenchSession` и project-bound materialization;
  - [x] 5.2 project page показывает materialized workbench shell;
  - [x] 5.3 отдельный route открывает locked preview workbench-session.
- [x] 6. Добавить unit/source-contract покрытие для нового слоя.
- [x] 7. Передать change на внешнюю verification-проверку.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `workbench`: `Workbench session принадлежит проекту, workflow и subject`, `Пользователь открывает workbench shell`;
  - `projects`: `Страница проекта делает верстак прощупываемым без допуска к работе`;
  - `workflow`: `Workflow материализует workbench shell для project-owned subject`, `Workflow открывает только locked workbench shell первой волны`.
- Уровень проверки:
  - `unit` и `static/contract`.
- Команда проверки:
  - `npm run test:unit -- test/unit/project-workbench-surface.test.ts`
  - `npm run test:traceability`
- Mock/fixture-данные и live credentials:
  - не требуются.
- Примечание:
  - при следующей волне стоит добавить browser/e2e-наблюдение за переходом `project page -> workbench preview`.
