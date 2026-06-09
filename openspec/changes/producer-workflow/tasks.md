## Tasks

- [ ] 1. Зафиксировать `producer-workflow` под `focus-domain`.
- [ ] 2. Закрепить workflow как видимый и управляемый процесс продукта.
- [ ] 3. Описать схему `project -> task -> workflow -> workbench`.
- [ ] 4. Зафиксировать, что `level-labs` являются legacy-проекцией workflow, а не целевой моделью.
- [ ] 5. Создать и привязать `dispatcher-workflow` как tactical owner workflow-линии.
- [ ] 6. Зафиксировать критерии readiness для следующих waves:
  - [ ] 6.1 foundation workflow model;
  - [ ] 6.2 user-facing manifestation step/fase;
  - [ ] 6.3 vertical workflow slices.
- [ ] 7. Подготовить тестовую и traceability-рамку для downstream behavior-change changes.
- [ ] 8. Выполнить проверку по `verification_command` из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить downstream-записи в `test/traceability/coverage-plan.json`, если конкретное покрытие будет отложено в последующих behavior-change changes.

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `workflow`: producer закрепляет workflow как процесс продукта;
  - `workbench`: workflow materializes шаги через Workbench;
  - `task`: workflow связывается с задачей и артефактами;
  - `level-labs`: producer фиксирует legacy-статус level-driven модели.
- Уровень проверки: static / traceability для producer-change.
- Команда запуска:
  - `npm run test:traceability`
- Mock/fixture-данные:
  - для самого producer-change не требуются;
  - downstream changes должны явно зафиксировать fixture/mocks для workflow definitions, transitions и step manifestation.
- Live credentials:
  - не требуются.
