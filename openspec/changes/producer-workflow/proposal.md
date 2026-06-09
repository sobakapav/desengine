## Why

Текущий active слой уже знает, что `workflow` существует как модель шагов и состояния. Но этого недостаточно для следующей волны:

- workflow пока слишком сильно завязан на представление “lab level как workflow step”;
- процесс пользователя ещё не проявлен как самостоятельная product-facing сущность;
- непонятно, как workflow соотносится с Workbench, Task и будущими vertical slices.

Нужен отдельный producer, который закрепит workflow не как техническую проекцию старого контура, а как видимый производственный процесс внутри продукта.

## What Changes

- Создаётся `producer-workflow` под `focus-domain`.
- Producer закрепляет workflow как first-class процесс продукта:
  - workflow управляет фазами и переходами работы;
  - workflow больше не считается скрытым отражением уровней;
  - workflow materializes шаги через Workbench и артефакты.
- Producer задаёт схему следующего контура:
  - `project` удерживает долгоживущий контекст;
  - `task` удерживает цель и набор артефактов;
  - `workflow` задаёт исполняемый путь;
  - `workbench` materializes конкретный шаг workflow.
- Producer создаёт tactical owner `dispatcher-workflow`.
- Producer задаёт readiness criteria для следующих waves:
  - понятна минимальная модель `WorkflowDefinition/Instance/Step`;
  - понятно, как workflow виден пользователю;
  - понятно, как workflow перестаёт зависеть от level-модели;
  - понятно, какие vertical workflow changes можно запускать после foundation.

## Non-goals

- Не реализовывать engine workflow кодом.
- Не фиксировать первый конкретный workflow как обязательный эталон в этом change.
- Не смешивать workflow со storage boundary проекта или с полным redesign Workbench.

## Capabilities

### Potentially Modified Capabilities
- `workflow`
- `workbench`
- `task`
- `level-labs`
- `projects`

## Impact

- `focus-domain` получает отдельную producer-линию workflow как product-facing процесса.
- Workflow перестаёт растворяться между task, лабораторными уровнями и workbench-экраном.
- `dispatcher-workflow` получает чёткий producer-контекст для downstream backlog.

## Acceptance Criteria

- В active OpenSpec есть `producer-workflow` под `focus-domain`.
- В producer зафиксировано, что workflow — это видимый и управляемый процесс продукта.
- В producer описана связь `project -> task -> workflow -> workbench`.
- В producer зафиксировано, что workflow не должен оставаться скрытой проекцией `level-labs`.
- В producer описаны критерии readiness для следующих behavior-change waves.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `workflow`
  - capability: `workbench`
  - capability: `task`
  - capability: `level-labs`
  - scenario: producer закрепляет workflow как видимый производственный процесс и задаёт переход от level-driven модели к workflow-driven контуру.
- Уровень проверки: `static/contract`.
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются на уровне producer-change.
- Live credentials: не требуются на уровне producer-change.
