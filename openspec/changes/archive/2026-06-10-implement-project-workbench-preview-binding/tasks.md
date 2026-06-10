## Tasks

- [x] 1. Зафиксировать project-scoped contract для `workbench` и preview semantics.
- [x] 2. Протянуть project context в `workbench` и `level-labs`:
  - [x] 2.1 `WorkbenchInstance` читает project contract;
  - [x] 2.2 лаборатория строит preview/workbench semantics внутри project contract.
- [x] 3. Обновить OpenSpec specs для `workbench`, `level-labs` и затронутых `task` / `projects`.
- [x] 4. Зафиксировать тестовую и traceability-рамку project-scoped workbench/preview binding.
- [x] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

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
- `npm run test:unit -- test/unit/workbench-platform-registry.test.ts test/unit/project-ui-kit-switching.test.ts`
- `npm run test:integration -- test/integration/task-routes.test.ts`
- `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs test/e2e/project-ui-kit-switching.spec.ts test/e2e/sandpack-preview-style-runtime.spec.ts`

Mock/fixture-данные и credentials:
- fixture-данные должны включать active project, project settings и workbench/preview scenario внутри него;
- live credentials не нужны.

## Детали закрытия по change

- Canonical `workbench`-контракт доведён до project-scoped формулировки: `WorkbenchInstance` не только несёт `projectId`, но и читает `ProjectWorkspace.settings` как часть project boundary.
- Canonical `level-labs`, `task` и `projects` уже содержат требуемые сценарии для project-scoped preview/workbench binding и не потребовали дополнительных правок в этом ownership-срезе.
- Traceability-рамка уже зафиксирована существующими привязками:
  - `test/unit/workbench-platform-registry.test.ts` покрывает `workbench`-контракт и binding `project/task/workflow step`;
  - `test/unit/project-ui-kit-switching.test.ts` покрывает `projects`, `level-labs` и `task` для `project.settings.uiKitId` / `project.settings.uiMode`;
  - `test/integration/task-routes.test.ts` проверяет route/runtime boundary для project-aware preview payload и hint flow;
  - `test/e2e/project-ui-kit-switching.spec.ts` и `test/e2e/sandpack-preview-style-runtime.spec.ts` остаются внешним browser-evidence слоем для active project и runtime-диагностики preview.
- Change подготовлен к внешней проверке без самостоятельной финальной верификации исполнителем: реализация и OpenSpec bookkeeping выровнены, следующий шаг принадлежит внешнему verifier.
