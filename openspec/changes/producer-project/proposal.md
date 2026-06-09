## Why

Сейчас desengine умеет вести работу в одной общей оболочке, но не даёт пользователю явной модели независимых проектов. Из-за этого уже существующие сущности существуют слишком плоско:

- задачи не живут внутри отдельного проектного контекста;
- workflow не оформлен как самостоятельный процесс решения внутри проекта;
- `UI kit` не является жёстким контрактом конкретного проекта;
- будущие привязки вроде `LLM`, `Figma` и `Git/GitHub` пока не имеют очевидного project-level owner'а.

Архивируемая продуктовая идея project mode уже зафиксировала, что проект должен стать новым верхним контекстом системы. Теперь нужен отдельный `producer`, который переводит эту идею в delivery-рамку внедрения сущности `Project`:

- без преждевременного roadmap-слоя;
- с MVP-first подходом;
- с акцентом на то, как уже существующие сущности начнут жить внутри `Project`.

## What Changes

- Создаётся `producer-project` под `focus-domain`.
- Producer фиксирует первый delivery-срез внедрения сущности `Project`:
  - в системе появляется сущность `Project`;
  - новый проект создаётся минимум с именем и базовым `UI kit`;
  - `UI kit` становится project-level контрактом для задач, workflow, верстаков и связанных артефактов.
- Первым downstream behavior-change producer назначает отдельный `implement`-change для `project entity and storage boundary`:
  - change вводит каноническую сущность `ProjectWorkspace`;
  - change определяет boundary выбора active project;
  - change поднимает `project.settings.uiKitId` и `project.settings.uiMode` как единый источник preview contract;
  - change не делает в той же волне полную project-scoped миграцию `task`, `workflow`, `workbench` и progress.
- Producer удерживает правило постепенной project-scoping migration:
  - сначала `ProjectWorkspace` и active project boundary;
  - затем onboarding/task-слой;
  - затем workflow-слой как отдельный процесс решения;
  - затем `workbench` / preview binding;
  - затем progress invalidation при смене `UI kit`;
  - затем project-level `LLM` binding;
  - затем `Figma`;
  - затем `Git` / `GitHub`.
- Producer определяет, какие downstream dispatcher/implement changes нужны, чтобы ввести `Project` без смешивания его с будущим `Project Roadmap`.

## Non-goals

- Не вводить roadmap проекта в первый delivery-срез.
- Не превращать change в прямую implement-ветку.
- Не определять окончательную модель всех project-scoped сущностей сразу.
- Не обещать немедленную project-level миграцию `LLM`, `Figma` и `Git/GitHub` в рамках первой волны.

## Capabilities

### Potentially New Capabilities
- `projects`

### Potentially Modified Capabilities
- `task`
- `workflow`
- `workbench`
- `level-labs`

## Impact

- `focus-domain` получает отдельный producer-контур для внедрения сущности `Project`.
- Доменное развитие перестаёт рассматривать `Project` как побочную настройку и начинает трактовать его как новый верхний контекст продукта.
- Downstream changes получают чёткую рамку:
  - сначала внедряется `ProjectWorkspace` и project boundary как foundation-слой;
  - затем отдельно решаются `task`, `workflow`, `workbench` и progress invalidation;
  - затем постепенно перепривязываются остальные части продукта;
  - roadmap проекта остаётся следующей волной, а не частью MVP.

## Acceptance Criteria

- В active OpenSpec есть `producer-project` под `focus-domain`.
- В producer зафиксирован смысл внедрения сущности `Project`:
  - проект является контейнером независимой работы;
  - проект создаётся с именем и базовым `UI kit`;
  - `UI kit` является глобальным контрактом проекта.
- В producer явно зафиксировано, что ближайший downstream шаг — отдельный `implement`-change для `project entity and storage boundary`.
- В producer перечислены уже существующие сущности, которые начнут постепенно становиться project-scoped.
- Для downstream changes зафиксировано, что workflow является отдельным process-layer, а смена project `UI kit` считается сложной миграцией, способной откатить часть прогресса.
- Сохранена явная граница между внедрением сущности `Project` и будущим `Project Roadmap`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `projects`
  - capability: `task`
  - capability: `workflow`
  - capability: `workbench`
  - scenario: producer фиксирует рамку внедрения сущности проекта, делегирует первым downstream шагом `project entity and storage boundary` и задаёт порядок переноса существующих сущностей в project context.
- Уровень проверки: `static/contract` (валидация OpenSpec-артефактов).
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются.
- Live credentials: не требуются.
