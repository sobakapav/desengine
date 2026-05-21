## Tasks

- [x] 1. Ввести contracts `WorkbenchDefinition`, `WorkbenchInstance`, `WorkbenchTool`.
- [x] 2. Создать registry для workbench definitions и tools.
- [x] 3. Описать текущий lab workbench как первый definition/profile.
- [x] 4. Связать WorkbenchInstance с project/task/workflow/artifact ids.
- [x] 5. Добавить serialization contract для workbench/tool state.
- [x] 6. Обновить OpenSpec specs `workbench`, `workbench-tools`, `level-labs`, `workflow`.
- [x] 7. Добавить tests:
  - [x] 7.1 unit registry validation;
  - [x] 7.2 unit state serialization;
  - [x] 7.3 source-contract текущего lab workbench;
  - [x] 7.4 browser/component smoke при изменении UI.
- [x] 8. Прогнать `npm run test:unit`, `npm run test:traceability`, при UI изменениях `npm run build`.

## Тестовая часть change

Затронутые capability/scenarios:
- `workbench`: workbench definition/instance.
- `workbench-tools`: tool registry и state contract.
- `level-labs`: lab workbench является profile общей платформы.
- `workflow`: workflow step может ссылаться на workbench instance.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: если меняется rendering/state flow.

Команды:
- `npm run test:unit`
- `npm run test:traceability`
- `npm run build` при UI boundary изменениях.

Mock/fixture-данные:
- Fixture workbench definition, tool definition, serialized instance.
