## Tasks

- [x] 1. Зафиксировать project-aware contract для workflow layer.
- [x] 2. Привязать workflow projection к active project context:
  - [x] 2.1 `WorkflowStepInstance` знает `projectId`;
  - [x] 2.2 workflow runtime не живёт как project-less глобальный процесс;
  - [x] 2.3 change не фиксирует жёсткое `1:1` между шагом и верстаком.
- [x] 3. Обновить OpenSpec specs для `workflow` и при необходимости `projects`.
- [x] 4. Зафиксировать тестовую и traceability-рамку project-aware workflow binding.
- [x] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: active project участвует в workflow layer.
- `workflow`: шаги решения и их состояние работают внутри project context.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для workflow projection и project-aware runtime models.
- component/browser: не требуется в этой реализации, потому что user-facing workflow surfaces не менялись.
- integration: не требуется в этой реализации, потому что task route handlers и task action HTTP boundary не менялись.
- e2e smoke: не требуется в этой реализации, потому что сквозной flow выбора проекта не расширялся.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- `npm run test:integration` остаётся общим downstream-слоем для внешнего проверяющего, но не является обязательной локальной проверкой этого change при неизменном HTTP boundary

Mock/fixture-данные и credentials:
- fixture-данные должны включать active project и workflow scenario внутри него;
- live credentials не нужны.

## Статус реализации

- Кодовые изменения ограничены workflow/task projection и prompt-context runtime boundary.
- Unit coverage зафиксирована в `test/unit/task-workflow-artifact-projection.test.ts` и `test/unit/prompt-context-runtime-boundary.test.ts`.
- Финальная общесистемная проверка не выполнялась исполнителем; change подготовлен к внешней проверке.
