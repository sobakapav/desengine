## Tasks

- [ ] 1. Зафиксировать `producer-kill-levels` под `focus-domain`.
- [ ] 2. Закрепить, что `level-labs` не являются долгосрочной целевой пользовательской моделью.
- [ ] 3. Описать controlled transition:
  - [ ] 3.1 что переносится в `project`, `task`, `workflow` и `workbench`;
  - [ ] 3.2 что считается legacy и должно уйти;
  - [ ] 3.3 что нельзя удалять до появления заменяющей модели.
- [ ] 4. Зафиксировать критерии readiness для демонтажа level-модели.
- [ ] 5. Передать нужный контекст соседним producer-линиям `producer-workbench` и `producer-workflow`.
- [ ] 6. Подготовить тестовую и traceability-рамку для downstream behavior-change changes.
- [ ] 7. Выполнить проверку по `verification_command` из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios.
- [x] Выбрать уровень проверки.
- [x] Зафиксировать команду проверки.
- [x] Описать mock/fixture-данные и live credentials, если нужны.
- [ ] Добавить downstream-записи в `test/traceability/coverage-plan.json`, если конкретное покрытие будет отложено в последующих behavior-change changes.

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `level-labs`: producer фиксирует legacy-статус и controlled transition;
  - `workflow`: новая process-модель становится заменяющим контуром;
  - `workbench`: новая рабочая поверхность становится заменяющим контуром;
  - `task`: демонтаж level-модели не должен терять task semantics.
- Уровень проверки: static / traceability для producer-change.
- Команда запуска:
  - `npm run test:traceability`
- Mock/fixture-данные:
  - для самого producer-change не требуются;
  - downstream changes должны явно зафиксировать fixture/mocks для legacy-level mapping и transition scenarios.
- Live credentials:
  - не требуются.
