## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
  - `workbench`:
    - `WorkbenchInstance связан с project/task/workflow step`
- [x] Выбрать уровень проверки
  - `static/contract` для `quality:text`
  - дополнительно `unit` для обновлённых source-контрактов
- [x] Добавить или обновить тесты
  - Обновлены source/unit-контракты:
    - `test/unit/project-ui-kit-switching.test.ts`
    - `test/unit/lab-screen-event-propagation.test.ts`
    - `test/unit/p1-source-contracts.test.ts`
- [x] Зафиксировать команду проверки
  - `npm run quality:text`
  - `npm run test:unit -- test/unit/project-ui-kit-switching.test.ts test/unit/lab-screen-event-propagation.test.ts test/unit/p1-source-contracts.test.ts`
- [x] Описать mock/fixture-данные и live credentials, если нужны
  - Используются только локальные source-fixture и unit-данные; live credentials не нужны.
