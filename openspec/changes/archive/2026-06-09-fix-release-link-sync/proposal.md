## Why

Сейчас при включении implement/fix change в релиз система может обновить только часть release-контекста. На практике это проявляется как расхождение между `.openspec.yaml` и `handoff.md`: один артефакт уже знает о `release_ref`, другой ещё нет.

Для OpenSpec workflow это критичная ошибка. Release inclusion должен быть атомарной управленческой операцией:

- change либо полностью входит в релиз;
- либо команда явно падает и не оставляет неоднозначного состояния.

## What Changes

- Вводится жёсткий sync-контракт для release-диспетчеризации.
- Если `os:dispatch` включает implement/fix change в релиз, он обязан:
  - записать `release_ref` в `.openspec.yaml`;
  - синхронизировать тот же `release_ref` в `handoff.md`;
  - проверить, что оба артефакта после операции согласованы.
- Если согласованность не достигнута, команда должна завершаться ошибкой, а не сообщать об успешном включении в релиз.

## Non-goals

- Не менять общую topology release/dispatcher/implement.
- Не переписывать вручную заполненный смысловой контент handoff за пределами служебных inherited полей.
- Не менять close-flow и release-notes sync, кроме случаев, где они зависят от корректного `release_ref`.

## Capabilities

### Modified Capabilities

- `admin-tools`: release dispatch обязан синхронно обновлять metadata и handoff.

## Acceptance Criteria

- Active spec явно требует полного sync при включении change в релиз.
- `os:dispatch` не объявляет success, если `release_ref` не совпадает между `.openspec.yaml` и `handoff.md`.
- Unit-покрытие проверяет release-dispatch path на наличие `release_ref` в обоих артефактах.

## Тестовая часть change

- Затронутые OpenSpec capability/scenarios:
  - `admin-tools`
  - scenario: release-диспетчеризация новой хотелки
  - scenario: release inclusion синхронно обновляет metadata и handoff
- Уровень проверки: `static/contract` + `unit`.
- Команда запуска: `npm run test:traceability && npm run test:unit -- openspec-handoff`.
- Mock/fixture-данные: локальные fixture-каталоги unit-тестов.
- Live credentials: не требуются.
