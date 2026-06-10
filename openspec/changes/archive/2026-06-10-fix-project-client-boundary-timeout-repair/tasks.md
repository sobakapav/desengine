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

## Фактическое выполнение

- Затронутые capability/scenarios: `task` / «Пользователь открывает task screen внутри активного проекта», `task` / «Task runtime сохраняет active project при действиях пользователя», `testing-layer` / «Unit-проверка читает project-aware task client boundary».
- Уровень проверки: `unit`.
- Обновлённые тесты: `test/unit/task-project-client-boundary.test.ts` теперь импортирует узкий helper-модуль вместо целых экранных компонентов.
- Команда проверки: `npm run test:unit -- test/unit/task-project-client-boundary.test.ts`.
- Mock/fixture/live credentials: не нужны; тест использует `fetch` spy и читает source-контракты локальных файлов.
