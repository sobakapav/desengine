## Tasks

- [x] 1. Сопоставить полный список active capability из `openspec/specs/**` с текущим `spec-coverage-map.json`.
- [x] 2. Добавить в карту отсутствующие capability с осмысленными priority и primaryLevels.
- [x] 3. Для каждого добавленного capability определить обязательные scenarios или scenario groups.
- [x] 4. Проверить, не требует ли кто-то из добавленных capability отдельной записи в `coverage-plan.json`.
- [x] 5. Подготовить изменение к внешней проверке по `verification_command`.

## Тестовая часть change

- [x] Указать затронутые OpenSpec capability/scenarios
- [x] Выбрать уровень проверки
- [x] Обновить traceability-данные
- [x] Зафиксировать команду проверки
- [x] Описать mock/fixture-данные и live credentials, если нужны

## Детали проверки

- Затронутые OpenSpec capability/scenarios: `testing-layer` / `Capability временно не имеет полного покрытия`.
- Уровень проверки: static/contract + traceability.
- Обновлённые артефакты: `test/traceability/spec-coverage-map.json`, при необходимости `test/traceability/coverage-plan.json`
- Команда запуска: `npm run test:traceability`
- Mock/fixture-данные: не требуются; live credentials не нужны.
- Финальная проверка по `verification_command` выполняется внешним проверяющим агентом или пользователем.
