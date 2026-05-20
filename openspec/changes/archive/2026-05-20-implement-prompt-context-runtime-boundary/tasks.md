## Tasks

- [x] 1. Ввести `PromptContext` contract.
- [x] 2. Реализовать builder из текущих project/task/workflow/artifact/workbench данных.
- [x] 3. Перевести start/iterate/check service flows на PromptContext без изменения HTTP contract.
- [x] 4. Зафиксировать downstream contract для `task-hints-templating` и `prompt-builder`.
- [x] 5. Обновить OpenSpec specs `prompt-context`, `llm`, `iteration`, `task`.
- [x] 6. Добавить unit/source-contract tests.
- [x] 7. Прогнать `npm run test:unit`, `npm run test:traceability`.

## Тестовая часть change

Затронутые capability/scenarios:
- `prompt-context`: builder включает project/task/workflow/artifacts/workbench.
- `llm`: start/iterate/check используют PromptContext.
- `iteration`: пользовательский prompt входит в context.
- `task`: service boundary не собирает prompt context ad-hoc.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- integration/e2e: не требуется, если HTTP/UX contract не меняется.

Команды:
- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:
- Fixture ProjectWorkspace, TaskInstance, WorkflowStepInstance, Artifact, WorkbenchInstance.
