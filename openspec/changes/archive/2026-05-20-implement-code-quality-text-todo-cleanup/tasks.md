## Tasks

- [x] 1. Найти все активные `todo-format` нарушения из `quality:text:repo`.
- [x] 2. Привести комментарии TODO/FIXME к формату подсистемы.
- [x] 3. Проверить `npm run quality:text:repo` и убедиться, что `todo-format` больше не активен.
- [x] 4. Проверить `npm run test:unit`.
- [x] 5. Проверить `npm run test:traceability`.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text` / `Администратор запускает полный quality-аудит`, `Новое нарушение не покрыто waiver`.
- [x] Уровень проверки: static/contract.
- [x] Команды запуска: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:traceability`.
- [x] Mock/fixture-данные: локальные исходники и waivers; live credentials не нужны.
