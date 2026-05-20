## Why

Текущий Workbench уже содержит редактор, preview, prompt composer, save/reset/check и project settings. Следующие направления (image inspector, layout workbench, workflow steps, tools) не должны добавлять новые локальные registry/state правила поверх компонента.

Этот change делает Workbench платформенной сущностью: definition, instance, tool registry и serialized state.

## What Changes

- Вводятся `WorkbenchDefinition` и `WorkbenchInstance`.
- Текущий lab workbench становится первым profile/definition.
- Вводится `WorkbenchTool` contract и registry.
- Tool state и workbench state получают сериализуемый shape.
- Workbench привязывается к `projectId`, `taskId`, `workflowStepId`, artifact bindings.

## Non-goals

- Не реализуем сразу image/layout tools.
- Не переписываем UI целиком.
- Не меняем Sandpack как технологию.

## Capabilities

### New Capabilities

- `workbench`: definition/instance lifecycle.
- `workbench-tools`: registry и tool contract.

### Modified Capabilities

- `level-labs`: текущий lab workbench становится workbench profile.
- `workflow`: step может ссылаться на workbench instance.

## Acceptance Criteria

- Есть общий contract для WorkbenchDefinition/Instance/Tool.
- Текущий lab workbench представлен как первый definition без заметного UX изменения.
- Tool registry позволяет добавить image/layout tool без локального хака в Workbench.
- State сериализуется и привязан к project/task/workflow step.
- Есть unit/contract tests и component/browser smoke, если меняется UI flow.
