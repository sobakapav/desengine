## Why

После появления canonical `ProjectWorkspace` и project-aware onboarding/task layer система всё ещё не описывает сам процесс решения как часть project contract. Если workflow оставить неявным или растворить его в `workbench`, первая project-wave снова смешает разные сущности:

- задача будет project-aware, но ход решения останется без собственного project boundary;
- `workbench` начнёт неявно владеть процессом решения, хотя это отдельный слой;
- downstream changes получат конфликтующие трактовки того, что такое workflow внутри проекта.

`producer-project` теперь прямо требует считать workflow отдельной сущностью процесса решения. Значит, нужен самостоятельный implement change, который привяжет workflow layer к активному проекту до `workbench` / preview binding.

## What Changes

- workflow layer начинает работать внутри active project context;
- `WorkflowStepInstance` и связанные workflow projection модели получают `projectId` как обязательную часть контракта;
- процесс решения фиксируется как отдельный слой между task-layer и workbench-layer;
- change не навязывает жёсткое соответствие между workflow step и `WorkbenchInstance`.

## Non-goals

- Не переопределять onboarding/task layer.
- Не закрывать в этой ветке `workbench` / preview binding.
- Не вводить progress invalidation при смене project `UI kit`.
- Не вводить `Project Roadmap` или внешние integrations.

## Capabilities

### Modified Capabilities

- `projects`: active project становится обязательным контекстом workflow layer.
- `workflow`: шаги решения и их состояние начинают жить внутри project contract.

## Acceptance Criteria

- workflow projection явно знает, в каком проекте он построен;
- workflow layer не описывается как безымянный глобальный процесс вне active project;
- процесс решения остаётся самостоятельным слоем и не подменяется `workbench`;
- тестовая часть change явно описывает `static/contract`, `unit`, `integration` и при необходимости browser/e2e слой.
