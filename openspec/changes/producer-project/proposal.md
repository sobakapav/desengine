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
  - сначала `implement-project-workspace-mvp` как foundation-wave для `ProjectWorkspace` и active project boundary;
  - затем `implement-project-task-onboarding-binding` как task/onboarding-wave;
  - затем `implement-project-workflow-binding` как отдельная workflow-wave;
  - затем `implement-project-workbench-preview-binding` как workbench/preview-wave;
  - затем `fix-project-ui-kit-migration-invalidation` как отдельная migration/invalidation-wave;
  - затем project-level `LLM` binding;
  - затем `Figma`;
  - затем `Git` / `GitHub`.
- Producer определяет нормативную downstream decomposition для MVP project-wave:
  - `implement-project-workspace-mvp` (`implement`) отвечает только за `ProjectWorkspace`, active project boundary и `project.settings`;
  - `implement-project-task-onboarding-binding` (`implement`) отвечает только за project-aware task onboarding, task open/start/check/save/reset boundaries;
  - `implement-project-workflow-binding` (`implement`) отвечает только за project-aware workflow artifacts и process-layer bindings;
  - `implement-project-workbench-preview-binding` (`implement`) отвечает только за project-aware workbench/preview contract;
  - `fix-project-ui-kit-migration-invalidation` (`fix`) отвечает только за последствия смены project `UI kit`, invalidation правил и пользовательские notices.
- Producer задаёт обязательную verification-рамку для downstream MVP-wave:
  - каждая волна обязана пройти `npm run test:traceability`;
  - foundation, task, workflow и migration waves обязаны иметь минимум `unit`, а task-wave дополнительно `integration`;
  - workbench и migration waves обязаны иметь `browser/runtime` проверку через `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <spec...>`;
  - если часть покрытия осознанно откладывается, downstream change обязан добавить запись в `test/traceability/coverage-plan.json` с причиной, уровнем проверки и этапом закрытия.

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
  - сначала внедряется `implement-project-workspace-mvp` как foundation-слой;
  - затем отдельно и в разных behavior-changes решаются `implement-project-task-onboarding-binding`, `implement-project-workflow-binding`, `implement-project-workbench-preview-binding` и `fix-project-ui-kit-migration-invalidation`;
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
- В producer явно перечислены конкретные downstream MVP-waves и их class:
  - `implement-project-workspace-mvp`;
  - `implement-project-task-onboarding-binding`;
  - `implement-project-workflow-binding`;
  - `implement-project-workbench-preview-binding`;
  - `fix-project-ui-kit-migration-invalidation`.
- Для downstream changes зафиксировано, что workflow является отдельным process-layer, а смена project `UI kit` считается сложной миграцией, способной откатить часть прогресса.
- Для downstream MVP-waves заранее зафиксирована verification-рамка:
  - обязательный `npm run test:traceability` для каждой волны;
  - `unit` для foundation/task/workflow/migration boundaries;
  - `integration` минимум для task binding;
  - `browser/runtime` минимум для workbench binding и `UI kit` migration;
  - обязательные mock/fixture expectations и правило явного `coverage-plan` при отсрочке.
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
- Downstream verification contract, который producer обязан зафиксировать заранее:
  - `implement-project-workspace-mvp`: `static/contract` + `unit`; команды `npm run test:traceability` и `npm run test:unit -- <project-workspace-focused-tests>`;
  - `implement-project-task-onboarding-binding`: `static/contract` + `unit` + `integration`; команды `npm run test:traceability`, `npm run test:unit -- <task-project-boundary-tests>`, `npm run test:integration -- <task-route-tests>`;
  - `implement-project-workflow-binding`: `static/contract` + `unit`; команды `npm run test:traceability`, `npm run test:unit -- <workflow-project-binding-tests>`;
  - `implement-project-workbench-preview-binding`: `static/contract` + `unit` + `browser/runtime`; команды `npm run test:traceability`, `npm run test:unit -- <workbench-project-binding-tests>`, `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <workbench-specs>`;
  - `fix-project-ui-kit-migration-invalidation`: `static/contract` + `unit` + `browser/runtime`; команды `npm run test:traceability`, `npm run test:unit -- <ui-kit-migration-tests>`, `DESENGINE_E2E_FIXTURE_ACCESS=1 node tools/testing/run-browser-verification-runtime.mjs <migration-specs>`;
  - для foundation/task/workflow/workbench/migration waves обязательны project-aware mock/fixture-данные (`ProjectWorkspace`, active project selection, project-bound task/workflow/workbench state, `UI kit` switch fixtures);
  - если любой из указанных уровней проверки откладывается, downstream wave обязана добавить запись в `test/traceability/coverage-plan.json` с причиной отсрочки, временным workaround и change/stage, в котором покрытие будет закрыто.
