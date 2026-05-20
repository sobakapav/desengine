## Tasks

- [x] 1. Зафиксировать OpenSpec сценарии для статичных и шаблонных task hints.
- [x] 2. Реализовать выбор источника `tip.njk`/`tip.md` с обратной совместимостью.
- [x] 3. Рендерить `tip.njk` через существующий prompt-template runtime.
- [x] 4. Передавать в шаблон минимальный task/level context.
- [x] 5. Добавить unit-тесты render/static/fallback/error behavior.
- [x] 6. Связать сценарии с traceability metadata.
- [x] 7. Прогнать проверки:
  - [x] 7.1 `npm run test:unit`
  - [x] 7.2 `npm run test:traceability`
- [x] 8. Протянуть выбранный пользователем UI kit проекта в `tip.njk` context и Workbench refetch.

## Тестовая часть change

Затронутые capability/scenarios:

- `task`: "Система читает статичную task-specific подсказку уровня"
- `task`: "Система рендерит шаблонную task-specific подсказку уровня"
- `task`: "Шаблонная task-specific подсказка учитывает выбранный UI kit проекта"
- `task`: "Шаблонная подсказка имеет приоритет над статичной"
- `task`: "Шаблон подсказки содержит ошибку"
- `task`: "Подсказка уровня отсутствует"

Уровни проверки:

- static/contract: OpenSpec spec delta и traceability metadata.
- unit: `test/unit/task-hints.test.ts`.

Команды:

- `npm run test:unit`
- `npm run test:traceability`

Mock/fixture-данные:

- Временный каталог onboarding tasks в unit-тесте.
- Synthetic `TaskConfig` и `LevelConfig`.
- Live credentials не нужны.

Coverage plan:

- Не требуется, покрытие добавляется в этом change.
