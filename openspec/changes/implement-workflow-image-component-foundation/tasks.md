## Tasks

- [x] 1. Зафиксировать OpenSpec delta для канонического image-to-component workflow и его legacy-bridge.
- [x] 2. Обновить workflow projection: coordinator step `Работаем над workflow` + catalog of workflow points вместо одного `level-lab` шага.
- [x] 3. Обновить workbench/readout/prompt-adjacent source contracts под новую workflow-модель.
- [x] 4. Подготовить внешнюю проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `workflow`, `workbench`, `projects`, `level-labs`.
- [x] Выбрать уровень проверки: `unit` и `source-contract`.
- [x] Добавить или обновить unit/source-contract тесты для workflow projection и workbench/readout surface.
- [x] Зафиксировать команду проверки: `npm run test:unit`.
- [x] Описать mock/fixture-данные и live credentials: используются локальные unit fixtures, live credentials не нужны.
