## Tasks

- [ ] 1. Собрать перечень текущих тестовых команд и точек входа.
- [ ] 2. Сопоставить существующие проверки с уровнями тестирования и OpenSpec traceability.
- [ ] 3. Описать, где используются mock/fixture-данные и где требуются live credentials.
- [ ] 4. Зафиксировать пробелы, дублирование и риски текущего тестового слоя.
- [ ] 5. Подготовить список follow-up changes для `focus-quality`.

## Тестовая часть change

Этот change продюсерский. В рамках него обязательны инвентаризация существующего тестового слоя, traceability-анализ и план последующих проверок, даже если новые тесты не добавляются.

Ожидаемая проверка результата:
- static/contract: сверка OpenSpec-артефактов и traceability-контекста.

Команды для последующих шагов:
- `npm run test:traceability`
- при follow-up implementation changes: `npm run test:unit`, `npm run test:e2e`, `npm run test:full` по необходимости

Mock/fixture-данные и credentials:
- В текущем producer change implement-исполнители не создаются, только инвентаризируются и документируются ожидания к downstream dispatcher.
