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
  - проект может позже получить roadmap/plan как управляемый слой поверх задач и workflow.
- Change удерживает вместе три поднаправления:
  - `Project Workspace` и `dev-mode`;
  - `Task`/`Workflow` как project-scoped сущности;
  - будущий `Project Roadmap` и связь roadmap ↔ задачи ↔ прогресс.
- Для первой волны приоритетом считается MVP project mode:
  - выбор активного проекта;
  - project-scoped данные и настройки;
  - привязка задач и workflow к проекту.
- Roadmap проекта остаётся следующей продуктовой волной после стабилизации MVP project mode.

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

## Impact

- В дереве активных changes появляется единый продуктовый контекст для project mode вместо раннего разведения темы на две независимые линии.
- Downstream changes получают MVP-first рамку:
  - сначала `Project Workspace` и project-scoped `Task` / `Workflow`;
  - затем `Project Roadmap` как отдельное расширение.
- OpenSpec-оформление change становится совместимым с текущей traceability-нормой для `idea/no-code`.

## Acceptance Criteria

- В OpenSpec есть единый idea-change, который описывает проектный режим как цельный продуктовый контур.
- В одном месте зафиксированы:
  - сущность проекта и project-scoped данные;
  - связь задач и workflow с проектом;
  - будущая связь roadmap проекта с задачами и прогрессом.
- Для downstream changes перечислены главные вопросы:
  - как устроен `Project Workspace`;
  - какие данные становятся project-scoped и в каком порядке;
  - нужен ли roadmap уже после MVP и как он влияет на выбор/шаблоны workflow задач;
  - как пользователь видит и управляет прогрессом проекта.
- Сохранён понятный тестовый и traceability-план для будущих behavior-change changes.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `projects`
  - capability: `task`
  - capability: `workflow`
  - scenario: OpenSpec фиксирует MVP-first декомпозицию project mode и traceability для последующих изменений.
- Уровень проверки: `static/contract` (валидация OpenSpec-артефактов).
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются.
- Live credentials: не требуются.
