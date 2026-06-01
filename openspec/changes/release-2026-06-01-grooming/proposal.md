## Why

Нужна новая активная релизная метка для текущей grooming-волны integration-слоя. Старый `release-2026-05-25-night` должен уйти в архив, но два active implement changes всё ещё требуют общего `release_ref`, чтобы delivery читался как единый срез и не ломал traceability.

## What Changes

- Создан release change `release-2026-06-01-grooming`.
- В релиз включена текущая grooming-волна integration-слоя:
  - `implement-integration-test-runner-foundation`
  - `implement-route-integration-fixture-wave`
- Release фиксирует состав поставки, но не подменяет ни `dispatcher-test-system`, ни producer baseline `producer-test-system-current-state`.

## Impact

- Состав active integration-wave остаётся явным и трассируемым.
- Downstream changes получают новую общую релизную метку через `release_ref`, не меняя `parent_change`.
- `release-2026-05-25-night` можно архивировать без разрыва active release-lineage.
