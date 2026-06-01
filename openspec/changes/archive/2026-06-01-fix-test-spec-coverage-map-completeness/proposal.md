## Why

Baseline test-system показал structural gap: активных capability в `openspec/specs/**` уже `33`, а `test/traceability/spec-coverage-map.json` описывает только `26`. Из-за этого карта обязательного покрытия отстаёт от реального контракта системы и перестаёт быть надёжным инструментом приоритезации.

## What Changes

- Добавить в `spec-coverage-map.json` отсутствующие active capability.
- Согласовать для них priority, primaryLevels и обязательные scenarios или scenario groups.
- Проверить, не нужно ли одновременно дополнить `coverage-plan.json`, если capability ещё не готов к полному покрытию.

## Non-goals

- Не добавлять в этом change новые runtime-тесты.
- Не менять сами OpenSpec specs по доменному смыслу.
- Не закрывать весь долг traceability metadata во всех тестах сразу.

## Impact

- Карта покрытия снова станет полной относительно active specs.
- `dispatcher-test-system` получит корректную основу для дальнейших implement/fix решений по coverage.
