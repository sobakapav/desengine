## Tasks

- [x] 1. Зафиксировать смену project `UI kit` как явную migration-операцию в OpenSpec-контракте.
- [x] 2. Описать правила compatibility re-check после migration:
  - [x] 2.1 какие task/workbench данные считаются совместимыми;
  - [x] 2.2 какие progress-состояния могут быть откатаны;
  - [x] 2.3 какой migration status должен видеть пользователь.
- [x] 3. Обновить OpenSpec specs для `projects`, `user-progress` и затронутых task/lab capability.
- [x] 4. Зафиксировать тестовую и traceability-рамку migration/invalidation поведения.
- [x] 5. Подготовить change к внешней проверке без самостоятельной финальной верификации исполнителем.

## Статус реализации

- MVP-реализация трактует смену `ProjectWorkspace.settings.uiKitId` как подтверждаемую migration-операцию.
- Selective invalidation ограничен текущим уровнем: migration возвращает его к стартовому состоянию, но сохраняет уже пройденные предыдущие уровни.
- Явный migration status сериализуется в `ProjectWorkspace.migration` и показывается в Workbench/preview.
- Change подготовлен к внешней проверке; финальную системную верификацию должен выполнить отдельный проверяющий.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `projects`: смена `uiKitId` становится migration-операцией.
- `user-progress`: несовместимый progress может быть откатан после migration.
- `task`: task validity зависит от нового project contract.
- `level-labs`: лаборатория показывает migration status и не маскирует несовместимость.

Уровни проверки:
- static/contract: обязателен.
- unit: обязателен для compatibility/invalidation decision logic.
- component/browser: обязателен, если migration status показывается в пользовательском UI.
- integration: обязателен, если migration проходит через route/runtime boundary и влияет на progress storage.
- e2e smoke: по необходимости, если есть сквозной flow смены project `UI kit` с откатом прогресса.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`
- `npm run test:unit`
- `npm run test:integration`
- browser/e2e-команда должна быть уточнена в ходе реализации, если change меняет пользовательский flow

Mock/fixture-данные и credentials:
- fixture-данные должны включать минимум один проект с уже начатой задачей, смену `uiKitId` и ожидаемое разделение на совместимый и невалидированный progress;
- live credentials не нужны.
