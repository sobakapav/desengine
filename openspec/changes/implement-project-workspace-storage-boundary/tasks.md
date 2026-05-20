## Tasks

- [ ] 1. Зафиксировать canonical `ProjectWorkspace` shape и связь с текущим preview `Project`.
- [ ] 2. Ввести project storage adapter interface без смены storage backend.
- [ ] 3. Перенести `uiKitId`/`uiMode` в project settings boundary.
- [ ] 4. Сохранить compatibility path для существующего localStorage project MVP.
- [ ] 5. Подключить active project context к lab/Sandpack без изменения основного UX.
- [ ] 6. Обновить OpenSpec specs для `projects`, `storage-adapter`, `level-labs`, `task`.
- [ ] 7. Добавить тесты:
  - [ ] 7.1 unit/contract для ProjectWorkspace normalization/serialization;
  - [ ] 7.2 unit для storage adapter;
  - [ ] 7.3 source-contract против второго Project shape;
  - [ ] 7.4 browser smoke для UI kit switching без перезагрузки, если меняется UI flow.
- [ ] 8. Прогнать `npm run test:unit`, `npm run test:traceability`, при необходимости `npm run build`.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: project registry, active project, project settings.
- `storage-adapter`: чтение/запись project-scoped данных.
- `level-labs`: lab использует active project context.
- `task`: будущая project-scoped привязка task runtime.

Уровни проверки:
- static/contract: обязательный.
- unit: обязательный.
- component/browser: если меняется Workbench UI.
- e2e smoke: только если затронут основной lab-flow.

Команды запуска:
- `npm run test:unit`
- `npm run test:traceability`
- `npm run build` при изменениях Next/Sandpack boundary.

Mock/fixture-данные и credentials:
- Локальные project fixtures; live credentials не нужны.

Если покрытие откладывается:
- Добавить запись в `test/traceability/coverage-plan.json` с причиной и `targetStage`.
