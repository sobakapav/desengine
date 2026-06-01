## Why

desengine должен поддерживать не только отдельные задачи, но и полноценную работу внутри проектов. Для этого пользователю нужен единый проектный контур, в котором:

- существует `Project Workspace` как контейнер данных и настроек;
- задачи и workflow живут внутри выбранного проекта;
- у проекта есть собственный roadmap/plan, который связывает задачи, этапы и прогресс.

Раньше эта тема была раздроблена на два producer-change:

- `producer-dev-mode-project-work` про проектный режим и project-scoped данные;
- `producer-project-roadmap-entity` про roadmap проекта и его связь с задачами.

По сути это одна и та же ранняя продуктовая идея. Делить её на две отдельные producer-линии было преждевременно.

## What Changes

- Создаётся единый idea-change `idea-project-mode` под `focus-product`.
- В нём фиксируется общая продуктовая гипотеза:
  - пользователь работает внутри выбранного проекта;
  - проект имеет собственные данные, настройки и рабочее пространство;
  - проект может иметь roadmap/plan как управляемый слой поверх задач и workflow.
- Change удерживает вместе три поднаправления:
  - `Project Workspace` и `dev-mode`;
  - `Task`/`Workflow` как project-scoped сущности;
  - `Project Roadmap` и связь roadmap ↔ задачи ↔ прогресс.

## Non-goals

- Не реализовывать полноценный project manager или PM-систему.
- Не вводить сразу многопользовательские проекты, роли и совместную работу.
- Не фиксировать окончательную runtime-модель storage и синхронизации на этой стадии.
- Не делать delivery-решения о конкретных implement/fix waves раньше времени.

## Capabilities

### Potentially New Capabilities
- `projects`
- `dev-mode`
- `project-roadmap`

### Potentially Modified Capabilities
- `task`
- `workflow`
- `level-labs`

## Acceptance Criteria

- В OpenSpec есть единый idea-change, который описывает проектный режим как цельный продуктовый контур.
- В одном месте зафиксированы:
  - сущность проекта и project-scoped данные;
  - связь задач и workflow с проектом;
  - roadmap проекта и его связь с задачами.
- Для downstream changes перечислены главные вопросы:
  - как устроен `Project Workspace`;
  - какие данные становятся project-scoped и в каком порядке;
  - как roadmap влияет на выбор/шаблоны workflow задач;
  - как пользователь видит и управляет прогрессом проекта.
- Сохранён понятный тестовый и traceability-план для будущих behavior-change changes.
