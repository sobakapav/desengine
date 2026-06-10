# Release Note

## Что меняется для пользователя:

- Workbench теперь явно показывает себя как рабочую поверхность, связанную с `project`, `task`, `workflow step` и `workbench instance`.
- Foundation-сущности `WorkbenchDefinition/Instance` выходят в runtime surface и больше не остаются только внутренней моделью.

## Как это влияет на пользователя:

- Пользователь видит, в каком product-контуре он работает: какой проект активен, какая задача открыта, какой workflow step materialized и какая рабочая поверхность за это отвечает.
- Workbench начинает читаться как новая главная рабочая поверхность, а не только как частный lab-экран.

## Как проверить:

- Запустить `npm run test:unit -- test/unit/workbench-platform-registry.test.ts test/unit/task-workflow-artifact-projection.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/p1-source-contracts.test.ts`.
- Убедиться, что header показывает новую surface-модель, а source/unit-контракты фиксируют связку `project -> task -> workflow step -> workbench`.
