## Tasks

- [ ] 1. Уточнить пользовательский и контрактный сценарий интеграции Monaco и Sandpack в лаборатории.
- [ ] 2. Определить рабочую boundary-схему между Monaco Editor, Sandpack preview и Workbench state.
- [ ] 3. Подготовить реализационные изменения user-facing editing/preview surface без нарушения adapter-границ.
- [ ] 4. Обновить OpenSpec-контракт, если интеграция меняет наблюдаемое поведение `level-labs` или `workbench-tools`.
- [ ] 5. Зафиксировать тестовую и traceability-рамку для component/browser-проверки интеграции.
- [ ] 6. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `level-labs`: сценарии редактирования файлов, fallback редактора и Sandpack preview внутри лаборатории.
- `workbench-tools`: сценарии адаптерной границы между Monaco и Sandpack.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для boundary/state-инвариантов, если они меняются.
- component/browser: обязателен, так как change меняет пользовательский editing/preview UX.
- integration: по необходимости, если изменится route/API boundary Sandpack payload.
- e2e smoke: по необходимости, если для уверенности понадобится сквозной lab-flow.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- browser/e2e-команда должна быть уточнена в ходе реализации после выбора конкретной поверхности проверки

Mock/fixture-данные и credentials:
- fixture-данные должны покрывать хотя бы один lab/task сценарий с редактируемым файлом и ожидаемым Sandpack preview;
- live credentials не нужны.
