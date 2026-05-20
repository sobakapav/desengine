## Tasks

- [x] 1. Создать каталог `tools/quality-text/rules/` и модули правил.
- [x] 2. Перевести `engine.mjs` на вызов rule-модулей без изменения CLI-контракта.
- [x] 3. Обновить unit/static contract ожидания для модульной структуры.
- [x] 4. Проверить `npm run test:unit`.
- [x] 5. Проверить `npm run quality:text`.
- [x] 6. Проверить `npm run test:traceability`.

## Тестовая часть change

- [x] Затронутые OpenSpec capability/scenarios: `code-quality-text` / `Разработчик запускает quality-проверку по рабочим изменениям`, `Новое нарушение не покрыто waiver`.
- [x] Уровень проверки: static/contract + unit.
- [x] Команды запуска: `npm run test:unit`, `npm run quality:text`, `npm run test:traceability`.
- [x] Mock/fixture-данные: локальные исходники и `tools/quality-text/waivers.json`; live credentials не нужны.
- [x] Покрытие не откладывается: static/unit contract обновлён в `test/unit/change-testing-guidance.test.ts`.
