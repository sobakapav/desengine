## Why

`npm run smoke` и `tools/repair-onboarding.mjs` сейчас могут сообщать пользователю, что onboarding “не готов”, даже когда фактический runtime-layout валиден.

Подтверждённый пример:
- runtime `lib/onboarding/server.ts` требует `onboarding/prompts/default.njk`;
- текущий контент действительно содержит `onboarding/prompts/default.njk`;
- smoke и repair tooling продолжают искать `onboarding/prompts/default.md`.
- во внешнем release-notes документе для `release-2026-05-24-night` ручная проверка тоже указывает на рассинхрон install/smoke tooling с реальным состоянием onboarding-слоя.

Для пользователя это выглядит как нестабильная система установки: диагностика просит чинить то, что уже соответствует runtime-контракту.

## What Changes

- Выровнять onboarding layout validation между runtime и CLI tooling.
- Сделать `default.njk` каноническим обязательным файлом там, где это уже определено runtime.
- Убрать ложные smoke/repair failures, возникающие только из-за устаревшего ожидания `.md`.

## Non-goals

- Не менять структуру onboarding-контента по доменному смыслу.
- Не переводить обратно prompt-layer на `.md`.
- Не чинить сетевой `git clone`, если проблема только в окружении.

## Impact

- install/smoke диагностика перестанет блокировать пользователя ложным onboarding-error.
- `repair-onboarding` будет валидировать тот же layout, который реально обслуживает runtime.
