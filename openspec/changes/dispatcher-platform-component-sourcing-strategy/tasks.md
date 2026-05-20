## Tasks

- [x] 1. Зафиксировать inventory текущих готовых primitives и их архитектурные роли.
- [x] 2. Ввести критерии `reuse / adapt / build`.
- [x] 3. Определить adapter/facade policy для Sandpack, Konva, Monaco, UI kit, charts/layout primitives.
- [x] 4. Обновить Workbench Platform Registry requirements: новый tool/workbench обязан иметь sourcing decision.
- [x] 5. Добавить OpenSpec specs `component-sourcing` и связать с `workbench`, `testing-layer`.
- [x] 6. Добавить static/source-contract checks, когда появится первый implementation change после этой стратегии.
- [x] 7. Прогнать `npx openspec validate dispatcher-platform-component-sourcing-strategy --strict`, `npm run test:traceability`.

## Тестовая часть change

Затронутые capability/scenarios:
- `component-sourcing`: выбор готового primitive через `reuse / adapt / build`.
- `workbench`: tool/workbench registry использует sourcing decision.
- `testing-layer`: sourcing decision фиксирует уровень проверки.

Уровни проверки:
- static/contract: обязательный.
- unit: для adapter implementation changes.
- component/browser: для UX primitives.
- live/provider: не требуется.

Команды запуска:
- `npx openspec validate dispatcher-platform-component-sourcing-strategy --strict`
- `npm run test:traceability`
- `npm run test:unit` при добавлении code checks.

Mock/fixture-данные и credentials:
- Не нужны для strategy-only change.

Если покрытие откладывается:
- Для strategy-only change покрытие не откладывается; implementation checks добавляются в downstream changes.
