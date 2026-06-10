## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
  - `workbench`:
    - `WorkbenchInstance связан с project/task/workflow step`
    - `Runtime surface показывает definition и рабочую связку`
  - `workflow`:
    - `Workflow step хранит project-aware runtime bindings без жёсткого 1:1 с Workbench`
    - `Runtime surface может показать текущий workflow step через Workbench`
- [x] Выбрать уровень проверки
  - `unit`
- [x] Добавить или обновить тесты
  - Обновлены source/unit-контракты:
    - `test/unit/workbench-platform-registry.test.ts`
    - `test/unit/project-ui-kit-switching.test.ts`
    - `test/unit/p1-source-contracts.test.ts`
- [x] Зафиксировать команду проверки
  - `npm run test:unit -- test/unit/workbench-platform-registry.test.ts test/unit/task-workflow-artifact-projection.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/p1-source-contracts.test.ts`
- [x] Описать mock/fixture-данные и live credentials, если нужны
  - Используются только локальные unit/source fixture-данные; live credentials не нужны.
