## Tasks

- [x] 1. Добавить release-note dispatcher change.
- [x] 2. Зафиксировать timeline удаления legacy aliases.
- [x] 3. Проверить `npm run test:unit`.
- [x] 4. Проверить `npm run test:traceability`.
- [x] 5. Проверить `npm run test:full`.
- [x] 6. Проверить `npm run quality:text:repo`.
- [x] 7. Обновить tasks dispatcher change по результатам implement-потомков.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text` / `Администратор запускает полный quality-аудит`, `Команда переходит на каноническую команду`; `testing-layer` / `Разработчик запускает полный локальный тестовый слой`.
- [x] Уровень проверки: static/contract + repo smoke.
- [x] Команды запуска: `npm run test:unit`, `npm run test:traceability`, `npm run test:full`, `npm run quality:text:repo`.
- [x] Mock/fixture-данные: локальные исходники и waivers; live credentials не нужны.
- [x] Покрытие не откладывается: repo-аудит выполнен после cleanup-итераций: 0 violations, 0 waived violations.
