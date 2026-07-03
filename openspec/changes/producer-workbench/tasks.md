## Tasks

## Текущий фокус реализации

- Producer-workbench временно сужен до поддержки основной цепочки `проект -> компоненты -> workflow -> работа`.
- Всё, что относится к новым tool families, layout/space как отдельной теме и image-inspector как самостоятельной волне, считается отложенным.

- [ ] 1. Зафиксировать `producer-workbench` под `focus-domain`.
- [ ] 2. Закрепить Workbench как materialized, но пока locked рабочую поверхность продукта.
- [ ] 3. Описать схему следующего контура:
  - [ ] 3.1 `project` задаёт контекст;
  - [ ] 3.2 `workflow` задаёт путь выполнения;
  - [ ] 3.3 `subject` задаёт предмет работы;
  - [ ] 3.4 `workbench` materializes шаг или фазу работы.
- [ ] 4. Зафиксировать, что `level-labs` не являются долгосрочной целевой моделью.
- [ ] 5. Передать tactical ownership существующему `dispatcher-workbench`.
- [ ] 6. Зафиксировать критерии readiness для следующих waves:
  - [ ] 6.1 foundation Workbench;
  - [ ] 6.2 workflow-driven UX;
  - [ ] 6.3 transition away from `level-labs`.
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
  - `workbench`: новая producer-рамка закрепляет Workbench как materialized и пока locked рабочую поверхность;
  - `workflow`: Workbench связывается с materialization workflow step;
  - `level-labs`: producer фиксирует legacy-статус лабораторной модели;
  - `projects`: Workbench должен открываться внутри project context.
- Уровень проверки: static / traceability для producer-change.
- Команда запуска:
  - `npm run test:traceability`
- Mock/fixture-данные:
  - для самого producer-change не требуются;
  - downstream changes должны явно зафиксировать fixture/mocks для Workbench navigation, workflow step materialization и legacy-lab transition.
- Live credentials:
  - не требуются.
