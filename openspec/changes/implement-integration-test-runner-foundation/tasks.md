## Tasks

- [ ] 1. Спроектировать integration runner как отдельный слой `node`-тестов без браузера и live env.
- [ ] 2. Реализовать entry point `npm run test:integration` и Vitest project `integration`.
- [ ] 3. Добавить shared helpers для вызова route handlers, фикстурного env и temp user-state.
- [ ] 4. Обновить `docs/testing-layer.md` и `test/README.md` под новый runnable integration-контур.
- [ ] 5. Подготовить foundation change к внешней проверке по `verification_command`.

## Тестовая часть change

- [ ] Указать затронутые OpenSpec capability/scenarios
- [ ] Выбрать уровень проверки
- [ ] Добавить или обновить тесты
- [ ] Зафиксировать команду проверки
- [ ] Описать mock/fixture-данные и live credentials, если нужны

## Детали проверки

- Затронутые OpenSpec capability/scenarios:
  - `testing-layer` / `Разработчик запускает integration-проверку server/API-flow`
  - `testing-layer` / `Разработчик запускает полный локальный тестовый слой`
- Уровень проверки: integration + static/contract.
- Ожидаемые тесты: integration harness и smoke-suite самого runner в `test/integration/**`.
- Команда запуска: `npm run test:integration`
- Mock/fixture-данные: используются route/API fixtures, temp user-state и локальный env без live credentials.
- Финальная проверка по `verification_command` выполняется внешним проверяющим агентом или пользователем.
