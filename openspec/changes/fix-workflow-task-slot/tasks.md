## Tasks

- [x] 1. Уточнить постановку и границы реализации
- [x] 2. Внести кодовые изменения
- [ ] 3. Выполнить проверку по verification_command из metadata

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

Затронутые OpenSpec capability/scenarios:
- `projects`: "Пользователь начинает работу над компонентом проекта", "Компонент проекта сохраняет связь с backing task".
- `workflow`: "Пользователь запускает workflow из компонента проекта".
- `testing-layer`: unit/source-contract проверки project-aware task boundary и component workflow surface.

Уровни проверки:
- unit

Команда запуска:
- `npm run test:unit`

Mock/fixture-данные и credentials:
- Достаточно локальных unit/source-contract тестов.
- Live credentials не нужны.
