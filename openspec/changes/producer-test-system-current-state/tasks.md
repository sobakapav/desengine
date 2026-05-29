## Tasks

- [x] 1. Собрать перечень текущих тестовых команд и точек входа.
- [x] 2. Сопоставить существующие проверки с уровнями тестирования и OpenSpec traceability.
- [x] 3. Описать, где используются mock/fixture-данные и где требуются live credentials.
- [x] 4. Зафиксировать пробелы, дублирование и риски текущего тестового слоя.
- [x] 5. Подготовить список follow-up changes для `focus-quality`.

Результат исследования:
- baseline и findings: `openspec/changes/producer-test-system-current-state/baseline.md`
- follow-up roadmap: `openspec/changes/producer-test-system-current-state/roadmaps/test-system-current-state.md`

## Тестовая часть change

Этот change продюсерский. В рамках него обязательны инвентаризация существующего тестового слоя, traceability-анализ и план последующих проверок, даже если новые тесты не добавляются.

Затронутые OpenSpec capability/scenarios:
- `testing-layer`: `Capability временно не имеет полного покрытия`.
- `testing-layer`: `Добавляется новый behavior-change`.
- `testing-layer`: `Разработчик запускает полный локальный тестовый слой`.

Ожидаемая проверка результата:
- static/contract: сверка OpenSpec-артефактов и traceability-контекста.
- unit: не требуется, change не меняет runtime.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды для последующих шагов:
- `npm run test:traceability`
- при follow-up implementation changes: `npm run test:unit`, `npm run test:e2e`, `npm run test:full` по необходимости

Mock/fixture-данные и credentials:
- В текущем producer change implement-исполнители не создаются, только инвентаризируются и документируются ожидания к downstream dispatcher.
