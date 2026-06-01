## Why

Нужна новая активная релизная метка для текущей grooming-волны integration-слоя. Старый `release-2026-05-25-night` должен уйти в архив, но два active implement changes всё ещё требуют общего `release_ref`, чтобы delivery читался как единый срез и не ломал traceability.

## What Changes

- Создан release change `release-2026-06-01-grooming`.
- В релиз включена текущая grooming-волна integration-слоя:
  - `implement-integration-test-runner-foundation`
  - `implement-route-integration-fixture-wave`
- В релиз добавлен инфраструктурный bugfix тестовой подсистемы:
  - `fix-browser-verification-runtime`
- В релиз добавлен documentation-fix для DeepSeek provider contract:
  - `fix-deepseek-doc-contract`
- Release фиксирует состав поставки, но не подменяет ни `dispatcher-test-system`, ни producer baseline `producer-test-system-current-state`.

## Impact

- Состав active integration-wave остаётся явным и трассируемым.
- Downstream changes получают общую релизную метку через `release_ref`, не меняя `parent_change`.
- `release-2026-05-25-night` можно архивировать без разрыва active release-lineage.
- Browser verification infrastructure становится частью ближайшего delivery-среза, а не остаётся неформальным blocker для product fixes.
- User-facing provider docs получают исправление там, где runtime уже ушёл вперёд, а документация ещё описывала старый DeepSeek contract.
