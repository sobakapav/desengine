## Tasks

- [x] 1. Зафиксировать OpenSpec delta:
  - [x] 1.1 `llm`
  - [x] 1.2 `onboarding-repo`
- [x] 2. Протащить `project` из клиента в check API.
- [x] 3. Вынести общий builder prompt context из логики task hints или собрать эквивалентный shared helper.
- [x] 4. Обновить hidden check prompt runtime:
  - [x] 4.1 `readLevelCheckPrompt` принимает context
  - [x] 4.2 `check.njk` видит `user.designSystemName`
  - [x] 4.3 effective UI kit учитывает `uiMode=html-tags`
- [x] 5. Добавить/обновить unit-тесты:
  - [x] 5.1 проверка прокидывания project state в check flow
  - [x] 5.2 проверка `user.designSystemName` в `check.njk`
  - [x] 5.3 fallback без project и/или при пустом context
- [x] 6. Связать сценарии с traceability metadata.
- [x] 7. Прогнать проверки:
  - [x] 7.1 `npm run test:unit`
  - [x] 7.2 `npm run test:traceability`

## Тестовая часть change

Затронутые capability/scenarios:

- `llm`: "Система рендерит hidden checking prompt уровня с project-aware context"
- `llm`: "Система передаёт в check prompt название выбранной дизайн-системы"
- `llm`: "Система использует effective UI kit для hidden check prompt"
- `onboarding-repo`: "Автор check prompt использует user/project переменные"

Уровни проверки:

- static/contract: OpenSpec delta и traceability metadata;
- unit: check route, prompt context builder, hidden check prompt rendering.

Команды:

- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:

- synthetic `Project` и prompt templates во временном каталоге unit-тестов;
- onboarding prompt fixtures из репозитория;
- live credentials не нужны.

Coverage plan:

- Не требуется, покрытие добавляется в рамках этого implement change.
