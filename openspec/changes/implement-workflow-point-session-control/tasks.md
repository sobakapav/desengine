## Tasks

- [x] 1. Зафиксировать OpenSpec delta для управляемых workflow-point controls внутри Workbench.
- [x] 2. Расширить Workbench surface model: selected/selectable point, related files, primary file target.
- [x] 3. Реализовать выбор workflow-point как перевод текущей сессии на связанный файл.
- [x] 4. Подготовить внешнюю проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `workflow`, `workbench`.
- [x] Выбрать уровень проверки: `unit` и `source-contract`.
- [x] Добавить или обновить тесты для workflow-point selection и связанных source-contract границ.
- [x] Зафиксировать команду проверки: `npm run test:unit`.
- [x] Описать mock/fixture-данные и live credentials: используются локальные unit fixtures, live credentials не нужны.
