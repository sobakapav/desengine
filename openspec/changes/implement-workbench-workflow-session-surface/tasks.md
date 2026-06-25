## Tasks

- [x] 1. Зафиксировать OpenSpec delta для пользовательской workflow-session поверхности Workbench.
- [x] 2. Обновить surface model Workbench: headline, workflow points, render-center summary.
- [x] 3. Перевести Workbench header/content/summary из языка уровней в язык workflow-сеанса без ломки action API.
- [x] 4. Подготовить внешнюю проверку по verification_command из metadata.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios: `workbench`, `workflow`, `level-labs`.
- [x] Выбрать уровень проверки: `unit` и `source-contract`.
- [x] Добавить или обновить тесты для workflow-session surface и связанных source-contract строк.
- [x] Зафиксировать команду проверки: `npm run test:unit`.
- [x] Описать mock/fixture-данные и live credentials: используются локальные unit fixtures, live credentials не нужны.
