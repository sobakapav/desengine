## Tasks

- [ ] 1. Ввести contracts `WorkbenchDefinition`, `WorkbenchInstance`, `WorkbenchTool`.
- [ ] 2. Создать registry для workbench definitions и tools.
- [ ] 3. Описать текущий lab workbench как первый definition/profile.
- [ ] 4. Связать WorkbenchInstance с project/task/workflow/artifact ids.
- [ ] 5. Добавить serialization contract для workbench/tool state.
- [ ] 6. Обновить OpenSpec specs `workbench`, `workbench-tools`, `level-labs`, `workflow`.
- [ ] 7. Добавить tests:
  - [ ] 7.1 unit registry validation;
  - [ ] 7.2 unit state serialization;
  - [ ] 7.3 source-contract текущего lab workbench;
  - [ ] 7.4 browser/component smoke при изменении UI.
- [ ] 8. Прогнать `npm run test:unit`, `npm run test:traceability`, при UI изменениях `npm run build`.

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
