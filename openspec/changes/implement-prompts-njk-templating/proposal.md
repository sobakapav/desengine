## Why

`dispatcher-prompts` нужен первый concrete implement, который закрепит правило "hidden prompts поддерживают `njk`-шаблоны" не только как идею, но и как change с релизной и тестовой трассировкой. По смыслу это тот же шаг, который уже был проделан для `task hints`, только теперь для hidden onboarding prompts.

## What Changes

- Формализуется поддержка `start/iterate/check` hidden prompts как `njk`-шаблонов через общий prompt-template runtime.
- Каноническим форматом prompt-файлов становится `.njk`; legacy `.md` при необходимости рассматривается только как совместимый fallback на время миграции.
- Фиксируется минимальный render context для prompt templates и правила его расширения.
- Добавляется тестовая опора: unit + traceability для lookup/render/fallback сценариев.

## Capabilities

### New Capabilities

- Нет.

### Modified Capabilities

- `llm`: runtime рендерит hidden prompts через общий template runtime, учитывает контекст и различает required/optional prompt behavior.
- `onboarding-repo`: onboarding prompt-файлы оформляются как `njk`-templates с shared partials/base templates и миграционным fallback.

## Impact

- `lib/prompt/**` и места вызова hidden prompts в LLM runtime.
- `onboarding/prompts/**` и авторские правила для prompt-контента.
- `test/unit/**`, traceability-слой и OpenSpec delta по `llm`/`onboarding-repo`.
