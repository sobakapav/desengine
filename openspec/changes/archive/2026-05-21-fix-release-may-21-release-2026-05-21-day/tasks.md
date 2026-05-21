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

- Затронутые OpenSpec capability/scenarios: `admin-tools` / `Разработчик переименовывает change через admin-команду` / `Разработчик задаёт имя change с голым суффиксом даты`
- Уровень проверки: unit
- Обновлённые тесты: `test/unit/openspec-rename.test.ts`
- Команда запуска: `npm run test:unit -- openspec-rename`
- Mock/fixture-данные: временный fixture-каталог с `openspec/changes`, live credentials не нужны
- Финальная проверка по `verification_command` выполняется внешним проверяющим агентом или пользователем
