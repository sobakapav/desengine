## Tasks

- [x] 1. Уточнить минимальный контракт live preflight: provider selection, список env и формат диагностики.
- [x] 2. Реализовать отдельный preflight для `test:live` на базе существующих env helpers.
- [x] 3. Добавить или обновить unit-тесты для missing-env и provider-specific сценариев.
- [x] 4. Обновить документацию тестового слоя под новый статус `test:live`.
- [x] 5. Подготовить изменение к внешней проверке по `verification_command`.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Добавить или обновить тесты
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

## Детали проверки

- Затронутые OpenSpec capability/scenarios: `testing-layer` / `Разработчик запускает live/provider-проверку`.
- Уровень проверки: unit + static/contract.
- Обновлённые тесты: `test/unit/test-env.test.ts`, `test/unit/live-provider-preflight.test.ts`, `test/unit/change-testing-guidance.test.ts`
- Команда запуска: `npm run test:unit`
- Mock/fixture-данные: используются локальные env fixtures и provider-specific значения без реальных секретов; live credentials не нужны.
- Финальная проверка по `verification_command` выполняется внешним проверяющим агентом или пользователем.
