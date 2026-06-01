## Why

Сейчас desengine умеет вести работу в одной общей оболочке, но не даёт пользователю явной модели независимых проектов. Из-за этого уже существующие сущности существуют слишком плоско:

- задачи не живут внутри отдельного проектного контекста;
- `UI kit` не является жёстким контрактом конкретного проекта;
- будущие привязки вроде `LLM`, `Figma` и `Git/GitHub` пока не имеют очевидного project-level owner'а.

Продуктовая идея `idea-project-mode` уже зафиксировала, что проект должен стать новым верхним контекстом системы. Теперь нужен отдельный `producer`, который переведёт эту идею в первую domain-oriented delivery-рамку:

- без преждевременного roadmap-слоя;
- с MVP-first подходом;
- с акцентом на то, как уже существующие сущности начнут жить внутри `Project`.

## What Changes

- Создаётся `producer-project-mvp` под `focus-domain`.
- Producer фиксирует первый delivery-срез project mode:
  - в системе появляется сущность `Project`;
  - новый проект создаётся минимум с именем и базовым `UI kit`;
  - `UI kit` становится project-level контрактом для задач, верстаков и связанных артефактов.
- Producer удерживает правило постепенной project-scoping migration:
  - сначала `Project` как контейнер независимой работы;
  - затем onboarding/task-слой;
  - затем project-level `LLM` binding;
  - затем `Figma`;
  - затем `Git` / `GitHub`.
- Producer определяет, какие downstream dispatcher/implement changes нужны, чтобы ввести MVP без смешивания его с будущим `Project Roadmap`.

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
- `workbench`
- `level-labs`
- `workflow`

## Impact

- `focus-domain` получает отдельный producer-контур для MVP project mode.
- Доменное развитие перестаёт рассматривать `Project` как побочную настройку и начинает трактовать его как новый верхний контекст продукта.
- Downstream changes получают чёткую рамку:
  - сначала внедряется сущность проекта и project-level `UI kit`;
  - затем постепенно перепривязываются остальные части продукта;
  - roadmap проекта остаётся следующей волной, а не частью MVP.

## Acceptance Criteria

- В active OpenSpec есть `producer-project-mvp` под `focus-domain`.
- В producer зафиксирован MVP-смысл сущности `Project`:
  - проект является контейнером независимой работы;
  - проект создаётся с именем и базовым `UI kit`;
  - `UI kit` является глобальным контрактом проекта.
- В producer перечислены уже существующие сущности, которые начнут постепенно становиться project-scoped.
- Для downstream changes зафиксировано, что смена project `UI kit` считается сложной миграцией, способной откатить часть прогресса.
- Сохранена явная граница между `Project MVP` и будущим `Project Roadmap`.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - capability: `projects`
  - capability: `task`
  - capability: `workbench`
  - scenario: producer фиксирует MVP-рамку сущности проекта и порядок переноса существующих сущностей в project context.
- Уровень проверки: `static/contract` (валидация OpenSpec-артефактов).
- Команда запуска: `npm run test:traceability`.
- Mock/fixture-данные: не требуются.
- Live credentials: не требуются.
