## Why

После появления Project Workspace нужно определить, что живёт внутри проекта. Сейчас текущая образовательная задача, lab files, prompt history, check-result и Sandpack preview связаны исторически. Для dev-mode, import, roadmap, workbench tools и future workflows нужен явный контракт `Task / Workflow / Artifact`.

Этот change превращает текущий lab task runtime в частный случай project-scoped task/workflow/artifact модели.

## What Changes

- Вводится `TaskInstance` как project-scoped сущность работы пользователя.
- Вводится `WorkflowDefinition` / `WorkflowInstance` / `WorkflowStep`.
- Вводится `Artifact` как общий контейнер входов/выходов: source image, generated code, prompt entry, check-result, imported design asset.
- Текущий lab level становится workflow step/profile.
- Текущий component file set становится artifact set/profile.

## Non-goals

- Не реализуем полный workflow editor.
- Не переносим все существующие задачи мгновенно в новую модель без compatibility path.
- Не меняем пользовательский lab UX радикально.

## Capabilities

### New Capabilities

- `task-model`: project-scoped task instance и task type/profile.
- `workflow`: workflow definitions/instances/steps.
- `artifacts`: входные и выходные артефакты task/workflow/workbench.

### Modified Capabilities

- `task`: текущий runtime становится совместимым с task-model.
- `level-labs`: lab level становится workflow step profile.

## Acceptance Criteria

- Описан минимальный контракт TaskInstance, WorkflowInstance, WorkflowStep и Artifact.
- Текущий lab-flow мапится в новую модель без потери UX.
- Есть compatibility plan для существующих task configs и user files.
- Следующие changes Workbench/Prompt/Event используют эти сущности, а не локальные дубли.
- Есть unit/contract тесты на serialization/mapping и traceability.
