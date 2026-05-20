## Tasks

- [x] 1. Зафиксировать OpenSpec delta для prompt-layer contract:
  - [x] 1.1 `llm`
  - [x] 1.2 `onboarding-repo`
- [x] 2. Унифицировать hidden prompts на общем `njk` runtime.
- [x] 3. Зафиксировать source lookup и совместимость:
  - [x] 3.1 `start.njk` как required prompt
  - [x] 3.2 `iterate.njk` и `check.njk` как optional prompts
  - [x] 3.3 legacy `.md` fallback только на период миграции
- [x] 4. Протащить и задокументировать минимальный render context для prompt templates.
- [x] 5. Добавить/обновить unit-тесты:
  - [x] 5.1 lookup prompt-файлов
  - [x] 5.2 render context
  - [x] 5.3 include/extends
  - [x] 5.4 fallback/error behavior
- [x] 6. Связать сценарии prompt-layer с traceability metadata.
- [x] 7. Прогнать проверки:
  - [x] 7.1 `npm run test:unit`
  - [x] 7.2 `npm run test:traceability`

## Тестовая часть change

Затронутые capability/scenarios:

- `llm`: "Система рендерит start prompt уровня через общий template runtime"
- `llm`: "Система передаёт в шаблон формализованный prompt context"
- `llm`: "Optional prompt деградирует без падения уровня"
- `onboarding-repo`: "Автор onboarding-уровня добавляет prompt как njk-шаблон"
- `onboarding-repo`: "Автор выносит общие части в shared partials"
- `onboarding-repo`: "Во время миграции рядом остаётся legacy prompt"

Уровни проверки:

- static/contract: OpenSpec spec delta и traceability metadata;
- unit: prompt runtime lookup/render/fallback/context.

Команды:

- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:

- `onboarding/prompts/**` как базовые fixtures;
- synthetic prompt templates во временном каталоге unit-тестов для error/fallback сценариев;
- live credentials не нужны.

Coverage plan:

- Не требуется, покрытие добавляется в рамках этого implement change.
