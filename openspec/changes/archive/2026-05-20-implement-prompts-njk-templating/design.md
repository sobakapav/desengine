## Context

В кодовой базе уже есть общий рендер `renderPromptTemplateFromRoot`, а в `onboarding/prompts/README.md` и текущих capability-спеках зафиксирован курс на `njk`. При этом для `dispatcher-prompts` нужен отдельный implement change, который соберёт эту логику в явный runtime contract, тестовую трассировку и релизную привязку.

## Decision

### 1. Канонический source contract

Для hidden prompts используются файлы:

- `onboarding/prompts/levels/<levelId>/start.njk`;
- `onboarding/prompts/levels/<levelId>/iterate.njk`;
- `onboarding/prompts/levels/<levelId>/check.njk`.

`start` остаётся required prompt уровня. `iterate` и `check` остаются optional. Legacy `.md` допустим только как временный fallback на время миграции исторического контента.

### 2. Единый путь рендера

Все hidden prompts должны проходить через общий prompt-template runtime, а не через отдельные ad hoc reader'ы. Это выравнивает поведение prompt-слоя с уже сделанным для `tip.njk`:

- один loader;
- одно поведение include/extends;
- единая стратегия ошибок и диагностики;
- один слой unit-тестов для рендера.

### 3. Prompt render context

Минимальный контракт контекста:

- `level.id`;
- `level.number`;
- `task.id`, если prompt рендерится в контексте конкретной задачи;
- `project` и `user` данные, только если они реально доступны в runtime.

Контекст должен быть расширяемым, чтобы следующие child changes могли добавлять новые поля без смены формата `njk`.

### 4. Fallback и ошибки

- отсутствие required `start.njk` остаётся ошибкой конфигурации уровня;
- отсутствие `iterate.njk` или `check.njk` приводит к пустому/optional fallback;
- ошибка рендера optional prompt не должна ронять весь runtime;
- если нужен совместимый raw fallback, он должен быть одинаково задокументирован в коде, тестах и OpenSpec.

### 5. Testing

Обязательные проверки:

- static/contract: delta для `llm` и `onboarding-repo`;
- unit: source lookup, context, include/extends, required/optional behavior, fallback/error handling;
- traceability: связь сценариев с `npm run test:traceability`.
