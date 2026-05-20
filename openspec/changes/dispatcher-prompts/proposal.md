## Why

Prompt-слой уже стал отдельной осью поведения onboarding, но в текущем дереве changes у него нет собственного dispatcher под `focus-onboarding`. Из-за этого договорённости о формате prompt-файлов, контексте рендера, миграции и тестовой трассировке размазаны между архивными change и текущими точечными правками.

## What Changes

- Создаётся `dispatcher-prompts` как родительский change под `focus-onboarding`.
- Dispatcher фиксирует канонический вектор для prompt-слоя: `njk`-шаблоны, общий runtime рендера, правила совместимости и тестовую интеграцию.
- Первый concrete implement внутри dispatcher: `implement-prompts-njk-templating`.
- Concrete implement changes для prompt-слоя дальше ведутся как дочерние changes этого dispatcher, а не как отдельные несвязанные инициативы.

## Capabilities

### New Capabilities

- Нет.

### Modified Capabilities

- `llm`: hidden prompts уровней оформляются как шаблоны, рендерящиеся через общий prompt-template runtime с формализованным контекстом и fallback-поведением.
- `onboarding-repo`: onboarding prompt-слой получает канонический authoring-contract для `start/iterate/check` шаблонов и shared partials.

## Impact

- `openspec/changes/**` и иерархия planning changes вокруг prompt-слоя.
- `openspec/specs/llm/spec.md` и `openspec/specs/onboarding-repo/spec.md`.
- `onboarding/prompts/**`, `lib/prompt/**`, unit/traceability слой тестирования.
