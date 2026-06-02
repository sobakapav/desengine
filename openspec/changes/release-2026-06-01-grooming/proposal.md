## Why

Нужна новая активная релизная метка для текущей grooming-волны integration-слоя. Старый `release-2026-05-25-night` должен уйти в архив, но два active implement changes всё ещё требуют общего `release_ref`, чтобы delivery читался как единый срез и не ломал traceability.

## What Changes

- Создан release change `release-2026-06-01-grooming`.
- В релиз включена текущая grooming-волна integration-слоя:
  - `implement-integration-test-runner-foundation`
  - `implement-route-integration-fixture-wave`
- В релиз добавлен инфраструктурный bugfix тестовой подсистемы:
  - `fix-browser-verification-runtime`
- В релиз добавлен fix для Codex seatbelt browser verification:
  - `fix-codex-browser-verification-gate`
  - `fix-browser-wrapper-managed-dev-cleanup`
- В релиз добавлены active fixes линии `dispatcher-bugfix`:
  - `fix-preview-check-parity`
  - `fix-check-reset-history-regression`
  - `fix-sandpack-ui-dependency-resolution`
  - `fix-sandpack-tailwind-preview-pipeline`
  - `fix-check-result-before-next-level-screen`
  - `fix-level-5-start-file-id-payload`
  - `fix-iterate-timeout-feedback`
- В релиз добавлен install-fix для dev root detection:
  - `fix-next-dev-workspace-root-warning`
- В релиз добавлен runtime-fix по Safari task instability:
  - `fix-safari-task-runtime-instability`
- В релиз добавлен onboarding/task-hints fix:
  - `fix-level-3-description-visibility`
- В релиз добавлен documentation-fix для DeepSeek provider contract:
  - `fix-deepseek-doc-contract`
- Release фиксирует состав поставки, но не подменяет ни `dispatcher-test-system`, ни baseline-выводы завершённого `producer-test-system-current-state`.

## Impact

- Состав active integration-wave остаётся явным и трассируемым.
- Downstream changes получают общую релизную метку через `release_ref`, не меняя `parent_change`.
- `release-2026-05-25-night` можно архивировать без разрыва active release-lineage.
- Browser verification infrastructure становится частью ближайшего delivery-среза, а не остаётся неформальным blocker для product fixes.
- Codex seatbelt получает канонический browser verification path вместо ложных direct-run browser/e2e verdict.
- Browser wrapper для verification и `os:close` больше не должен ломаться на конфликтующем или stale managed `next dev`.
- В ближайший релиз попадает весь активный downstream набор `dispatcher-bugfix`, а не только отдельные точечные fixes.
- В релиз входят актуальные fixes вокруг preview, описаний уровней, dev-runtime предупреждений и стабильности Safari.
- User-facing provider docs получают исправление там, где runtime уже ушёл вперёд, а документация ещё описывала старый DeepSeek contract.
