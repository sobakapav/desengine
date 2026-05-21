## Tasks

- [x] 1. Зафиксировать минимальные TypeScript contracts: `TaskInstance`, `WorkflowInstance`, `WorkflowStepInstance`, `Artifact`.
- [x] 2. Описать mapping текущего lab task/progress/file-set/check-result в новую модель.
- [x] 3. Ввести read-only projection helpers без миграции storage на первом шаге.
- [x] 4. Обновить OpenSpec specs для `task-model`, `workflow`, `artifacts`, `task`, `level-labs`.
- [x] 5. Добавить tests:
  - [x] 5.1 unit/contract для shapes;
  - [x] 5.2 unit для mapping текущего `TaskData`;
  - [x] 5.3 traceability на новые scenarios.
- [x] 6. Прогнать `npm run test:unit`, `npm run test:traceability`.

## Тестовая часть change

Затронутые capability/scenarios:
- `task-model`: задача получает project scope и workflow binding.
- `workflow`: шаг workflow имеет входы/выходы и status.
- `artifacts`: code/prompt/check/image artifacts имеют общий контракт.
- `level-labs`: текущий lab level мапится в workflow step.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- integration/browser: не требуется, пока вводится projection без UX изменения.

Команды:
- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:
- Fixture текущего `TaskData`, progress, workbench files и check-result.

Если покрытие откладывается:
- Добавить `coverage-plan` с причиной и `targetStage`.
