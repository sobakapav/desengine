## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [x] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

## Статус выполнения

- Затронута capability: `workbench`
- Затронутый сценарий: quality-представление нетривиального экспортируемого API `createLabWorkbenchInstance`
- Уровень проверки: `unit`
- Команда проверки: `npm run quality:text`
- Тесты: новые runtime-тесты не добавлялись, потому что change не меняет поведение и закрывает только textual quality gate
- Mock/fixture/live credentials: не требуются
