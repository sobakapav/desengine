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

## Детали проверки

- Затронутые OpenSpec capability/scenarios: `admin-tools` / `Разработчик выводит список релизов` / `Release-диспетчеризация новой хотелки` / `Разработчик открывает implement/fix из release-контекста через os:ctx`
- Уровень проверки: unit
- Обновлённые тесты: `test/unit/openspec-release-list.test.ts`, `test/unit/openspec-handoff.test.ts`, `test/unit/openspec-roadmap-inheritance.test.ts`
- Команда запуска: `npm run test:unit -- openspec-release-list openspec-handoff openspec-roadmap-inheritance`
- Mock/fixture-данные: временные каталоги `openspec/changes/**`, локальные shim-скрипты для `npm` и `openspec` внутри unit-fixture, live credentials не нужны
- Финальная проверка по `verification_command` выполняется внешним проверяющим агентом или пользователем
