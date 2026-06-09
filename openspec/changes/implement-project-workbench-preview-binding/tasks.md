## Tasks

- [ ] 1. Зафиксировать project-scoped contract для `workbench` и preview semantics.
- [ ] 2. Протянуть project context в `workbench` и `level-labs`:
  - [ ] 2.1 `WorkbenchInstance` читает project contract;
  - [ ] 2.2 лаборатория строит preview/workbench semantics внутри project contract.
- [ ] 3. Обновить OpenSpec specs для `workbench`, `level-labs` и затронутых `task` / `projects`.
- [ ] 4. Зафиксировать тестовую и traceability-рамку project-scoped workbench/preview binding.
- [ ] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `workbench`: workbench instance и входной контракт верстака привязаны к проекту.
- `level-labs`: лаборатория строит preview/workbench flow внутри project contract.
- `task`: preview/workbench contract использует project settings как часть project boundary.
- `projects`: project boundary участвует в рабочем контуре после task-layer и workflow-layer.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для workbench/preview model-binding слоёв.
- component/browser: обязателен, если реализация меняет пользовательские lab/workbench surfaces.
- integration: обязателен для route/runtime boundary preview/workbench flows.
- e2e smoke: по необходимости, если меняется сквозной flow открытия lab внутри active project.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- `npm run test:integration`
- browser/e2e-команда должна быть уточнена в ходе реализации, если change меняет пользовательский flow

Mock/fixture-данные и credentials:
- fixture-данные должны включать active project, project settings и workbench/preview scenario внутри него;
- live credentials не нужны.
