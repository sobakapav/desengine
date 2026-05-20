## Tasks

- [x] 1. Зафиксировать `dispatcher-prompts` как корневой planning change под `focus-onboarding`.
- [x] 2. Описать канонический prompt-контур:
  - [x] 2.1 `njk` как основной формат hidden prompts
  - [x] 2.2 общий prompt-template runtime
  - [x] 2.3 authoring-contract для `onboarding/prompts/**`
- [x] 3. Создать первый child implement `implement-prompts-njk-templating`.
- [x] 4. Привязать первый implement к ближайшему релизу через `release_ref`.
- [x] 5. Зафиксировать обязательную тестовую опору для prompt-layer changes:
  - [x] 5.1 static/contract
  - [x] 5.2 unit
  - [x] 5.3 traceability

## Тестовая часть change

Затронутые capability/scenarios:

- `llm`: hidden prompt уровня рендерится как шаблон через общий runtime.
- `llm`: optional prompt деградирует предсказуемо при отсутствии или ошибке шаблона.
- `onboarding-repo`: автор хранит level-specific prompts как `njk`-файлы и может использовать shared partials.

Уровни проверки:

- static/contract: OpenSpec delta для `llm` и `onboarding-repo`;
- unit: runtime lookup/render/fallback/context;
- traceability: связать сценарии prompt-layer с общим слоем тестирования.

Команды:

- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:

- prompt fixtures из `onboarding/prompts/**` и synthetic шаблоны во временном каталоге unit-тестов;
- live credentials не нужны.

Coverage plan:

- Не требуется, покрытие для dispatcher не откладывается, а задаётся как обязательное требование для child implements.
