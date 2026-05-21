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

## Детали проверки

- Затронутые OpenSpec capability/scenarios: `admin-tools` / `Разработчик выводит список релизов`
- Уровень проверки: unit
- Обновлённые тесты: `test/unit/openspec-release-list.test.ts`
- Команда запуска: `npm run test:unit -- openspec-release-list`
- Mock/fixture-данные: временный fixture-каталог с `openspec/changes` и `openspec/changes/archive`, live credentials не нужны
- Финальная проверка по `verification_command` выполняется внешним проверяющим агентом или пользователем
