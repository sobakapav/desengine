## Context

В репозитории уже есть рабочий фундамент prompt templates: `lib/prompt/render/server.ts`, `lib/prompt/server.ts`, `onboarding/prompts/README.md` и unit-тесты вокруг Nunjucks. Кроме того, в архиве уже есть change `nunjucks-prompts-templates`, но в текущем стратегическом дереве под `focus-onboarding` нет dispatcher, который бы держал эту область как отдельный продуктовый контур.

## Decision

`dispatcher-prompts` становится корневым change для prompt-слоя в onboarding и отвечает не за код напрямую, а за согласованность следующих решений:

1. Hidden prompts (`start`, `iterate`, `check`) описываются как `njk`-шаблоны и рендерятся через общий runtime prompt templates.
2. Authoring-contract хранится в capability `onboarding-repo`: где лежат файлы, какие из них обязательны, как использовать shared partials/base templates, как вести совместимость с legacy-форматом.
3. Runtime-contract хранится в capability `llm`: как lookup prompt-файлов связывается с `levelId`, какой context передаётся в шаблон и как система деградирует при отсутствии/ошибке optional prompt.
4. Все concrete реализации prompt-слоя ведутся отдельными child implement changes. Первый child change — `implement-prompts-njk-templating`.
5. Первый implement привязывается к ближайшему релизному потоку `release-2026-05-21-day`, чтобы prompt-слой появился в релизной трассировке сразу.

## Scope Boundaries

В рамки dispatcher входят:

- hidden onboarding prompts и их runtime;
- prompt authoring contract для `onboarding/prompts/**`;
- unit/traceability требования для prompt-layer changes.

Вне рамок dispatcher остаются:

- task hints (`tip.md`/`tip.njk`) как отдельная линия внутри `dispatcher-tasks`;
- пользовательский UI редактора промптов;
- смена шаблонного движка или install-critical инфраструктуры.

## Testing Posture

Для всех child implement changes этого dispatcher базовая тестовая опора обязана включать:

- static/contract: spec delta + traceability;
- unit: runtime lookup/render/fallback/context;
- при необходимости integration/e2e только если change затрагивает пользовательский поток, а не только серверный prompt runtime.
