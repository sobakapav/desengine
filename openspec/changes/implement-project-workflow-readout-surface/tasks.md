## Tasks

- [x] 1. Зафиксировать user-facing read-only contract для project workflow/artifact surface.
- [x] 2. Реализовать project workflow readout:
  - [x] 2.1 показать current workflow step;
  - [x] 2.2 показать project-aware artifacts;
  - [x] 2.3 показать bindings между project, task, workflow step и Workbench.
- [x] 3. Обновить OpenSpec delta для capability `projects` и `workflow`.
- [x] 4. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: пользователь видит workflow/readout проекта.
- `workflow`: project-aware workflow проявлен как отдельный read-only пользовательский слой.
- `workbench`: runtime bindings между workflow step и Workbench видимы пользователю.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для projection/readout helpers.
- component/browser: обязателен, если реализуется интерактивный project workflow panel.
- integration: не обязателен, если change остаётся в current page/projection boundaries.
- e2e smoke: по необходимости.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit -- <project-workflow-readout-tests>`

Mock/fixture-данные и credentials:
- fixtures должны включать task/workflow/artifact/workbench projection для одного проекта;
- live credentials не нужны.
