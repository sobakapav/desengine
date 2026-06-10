## Why

Текущие project/preview контракты уже позволяют менять `uiKitId`, но пока эта операция слишком похожа на обычный toggle. Это противоречит `producer-project`, где смена project `UI kit` заранее зафиксирована как тяжёлая migration-операция, способная откатывать часть прогресса.

Если не закрыть этот разрыв сейчас:

- проект будет выглядеть архитектурно нечестным: глобальный contract меняется без последствий;
- task/workflow/workbench progress станет невалидным, но система не сообщит об этом явно;
- fixture/test expectations будут жить в ложном предположении, что project `UI kit` можно менять без миграции.

Нужен отдельный `fix`, который делает migration-поведение явным и проверяемым.

## What Changes

- Смена project `UI kit` фиксируется как явная migration-операция, а не как прозрачный toggle.
- Runtime переоценивает task/workflow/workbench compatibility после смены базового `UI kit`.
- Несовместимый progress может откатываться в состояние, требующее повторного прохождения задачи или уровня.
- Лаборатория и project runtime показывают явный migration status вместо молчаливой подмены контракта.

## Non-goals

- Не вводить автоматическую конвертацию пользовательского кода между UI kit'ами.
- Не мигрировать сразу весь project content во "вторую модель".
- Не отменять возможность смены `UI kit` вообще.
- Не закрывать всю project entity/task/workflow/workbench binding логику внутри этой ветки.

## Capabilities

### Modified Capabilities

- `projects`: смена `uiKitId` становится явной migration-операцией проекта.
- `task`: task validity зависит от совместимости с новым project contract.
- `user-progress`: project migration может откатывать несовместимый progress.
- `level-labs`: лаборатория показывает migration status и не продолжает silently жить на устаревшем contract.

## Acceptance Criteria

- OpenSpec явно фиксирует, что смена project `UI kit` не считается дешёвым toggle.
- Runtime обязан переоценивать task/workflow/workbench compatibility после migration.
- Несовместимый progress может быть откатан без неоднозначной "полувалидной" середины.
- Пользователь получает явный migration signal, а не скрытую деградацию.
- Тестовая часть change фиксирует проверку progress invalidation и migration diagnostics.
