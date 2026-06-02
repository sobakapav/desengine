## Tasks

- [ ] 1. Зафиксировать producer-контур `speed-and-load` под `focus-quality`.
- [ ] 2. Собрать в change исходную карту проблем:
  - [ ] 2.1 перечислить известные симптомы деградации скорости;
  - [ ] 2.2 перечислить наблюдаемые или подозреваемые утечки;
  - [ ] 2.3 отделить подтверждённые проблемы от гипотез.
- [ ] 3. Зафиксировать рамку допустимой нагрузки:
  - [ ] 3.1 определить ключевые режимы нагрузки;
  - [ ] 3.2 определить, какие метрики и признаки деградации обязательны;
  - [ ] 3.3 описать, что считать приемлемой скоростью работы.
- [ ] 4. Подготовить downstream-карту работ:
  - [ ] 4.1 определить, какие направления нужно отдавать в `dispatcher` changes;
  - [ ] 4.2 развести исследовательские, измерительные и исправляющие ветки;
  - [ ] 4.3 зафиксировать порядок постановки этих работ.
  - [ ] 4.4 Для user-facing режима `npm run start` выпустить первичную implement-карту:
    - [ ] 4.4.1 `implement-workbench-preview-payload-budgeting` под `dispatcher-workbench`;
    - [ ] 4.4.2 `implement-runtime-task-load-guardrails` под `dispatcher-runtime`;
    - [ ] 4.4.3 `implement-runtime-llm-payload-budgets` под `dispatcher-runtime`.
  - [ ] 4.5 Выпустить глобальную follow-up волну:
    - [ ] 4.5.1 `implement-test-performance-budget-verdicts` под `dispatcher-test-system`;
    - [ ] 4.5.2 `implement-test-speed-load-regression-harness` под `dispatcher-test-system`;
    - [ ] 4.5.3 `implement-runtime-speed-observability` под `dispatcher-runtime`.
- [ ] 5. Обеспечить тестовую и traceability-готовность будущих behavior-change changes:
  - [ ] 5.1 перечислить ожидаемые уровни проверки для downstream-веток;
  - [ ] 5.2 зафиксировать требования к verification commands, mock/fixture-данным и coverage-plan.
- [ ] 6. Выполнить проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны
- [ ] Добавить downstream-записи в `test/traceability/coverage-plan.json`, если конкретное покрытие будет отложено

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `admin-tools`: active topology и корректное оформление producer-change в дереве OpenSpec;
  - `testing-layer`: traceability-требование к тестовой постановке downstream behavior-change веток.
- Уровень проверки: static / traceability для producer-change.
- Команда запуска:
  - `npm run test:traceability`
- Mock/fixture-данные:
  - для самого producer-change не требуются;
  - downstream changes должны будут явно фиксировать свои fixture/mocks и credentials по месту.
- Live credentials:
  - для самого producer-change не требуются;
  - downstream changes должны отдельно фиксировать credential expectations по месту.
