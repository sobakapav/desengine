## Why

Нужна отдельная активная релизная метка для quality-волны, которая одновременно оформляет текущий downstream delivery-срез `producer-speed-and-load` и весь активный UX-набор под `dispatcher-ux`. Без этого часть active implement changes останется только в producer/dispatcher topology и не будет собрана в единый release lineage.

## What Changes

- Создан release change `release-2026-06-02-quality`.
- В релиз включены active implement changes speed/load-линии:
  - `implement-workbench-preview-payload-budgeting`
  - `implement-runtime-task-load-guardrails`
  - `implement-runtime-llm-payload-budgets`
  - `implement-test-performance-budget-verdicts`
  - `implement-test-speed-load-regression-harness`
  - `implement-runtime-speed-observability`
- В релиз включены все active потомки `dispatcher-ux`:
  - `implement-level-reset-entrypoint`
  - `implement-ux-highlight-correct-solution-diff`
  - `implement-ux-merge-generate-check-phases`
  - `implement-ux-return-to-level-task-list`
- Для этих changes фиксируется общий `release_ref=release-2026-06-02-quality`.
- Release фиксирует состав quality-волны, но не подменяет ни producer-контекст `producer-speed-and-load`, ни тактические решения `dispatcher-workbench`, `dispatcher-runtime`, `dispatcher-test-system` и `dispatcher-ux`.

## Impact

- Downstream implement changes speed/load-линии и UX-потомки `dispatcher-ux` получают единый release lineage.
- `producer-speed-and-load` читается как источник speed/load-среза этого релиза, а `dispatcher-ux` как отдельная active UX-линия в той же quality-волне.
- Traceability для обеих активных линий становится явной без изменения `parent_change` и `producer_ref` downstream changes.
