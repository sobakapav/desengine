## Why

Нужна отдельная релизная метка для ночной волны улучшения `test:integration`. Без неё integration-runner и первая route/API волна повиснут как разрозненные changes, а связь между исследованием текущего тестового слоя, dispatcher-test-system и реальным delivery будет плохо читаться.

## What Changes

- Создан release change `release-2026-05-25-night`.
- В релиз включена ночная волна улучшения integration-слоя:
  - `implement-integration-test-runner-foundation`
  - `implement-route-integration-fixture-wave`
- Release фиксирует состав поставки, но не подменяет ни `dispatcher-test-system`, ни producer baseline `producer-test-system-current-state`.

## Impact

- Состав integration-wave становится явным и трассируемым.
- Downstream changes получают общую релизную метку через `release_ref`, не меняя `parent_change`.
