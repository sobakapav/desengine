## Why

Нужна отдельная активная релизная метка для quality-волны, которая оформляет текущий downstream delivery-срез `producer-speed-and-load`, preview/runtime hardening, testing contract и release-tooling качества. Прямые UI/UX changes не должны размывать смысл этой волны.

## What Changes

- Создан release change `release-2026-06-02-quality`.
- В релиз включены active implement changes speed/load-линии:
  - `implement-workbench-preview-payload-budgeting`
  - `implement-runtime-task-load-guardrails`
  - `implement-runtime-llm-payload-budgets`
  - `implement-test-performance-budget-verdicts`
  - `implement-test-speed-load-regression-harness`
  - `implement-runtime-speed-observability`
- В релиз включены дополнительные under-the-hood quality changes:
  - `fix-browser-webcrypto-insecure-context`
  - `fix-monaco-cancellation-noise`
  - `fix-preview-radix-slot-runtime`
  - `fix-preview-contract-review-gaps`
  - `implement-test-real-onboarding-smoke-contract`
  - `fix-release-notes-close-sync`
  - `fix-release-close-active-members-guard`
  - `fix-release-members-kind`
  - `fix-release-link-sync`
- Для этих changes фиксируется общий `release_ref=release-2026-06-02-quality`.
- Release фиксирует состав quality-волны, но не подменяет ни producer-контекст `producer-speed-and-load`, ни тактические решения `dispatcher-workbench`, `dispatcher-runtime`, `dispatcher-test-system` и `dispatcher-bugfix`.

## Impact

- Downstream speed/load, runtime hardening и testing/release-quality changes получают единый release lineage.
- OpenSpec release-tooling quality fixes из `dispatcher-openspec` входят в тот же quality-срез и не остаются вне общей under-the-hood волны.
- `producer-speed-and-load` читается как источник технического performance-среза этого релиза, а preview/runtime/test changes дополняют его без прямого UI-сдвига.
- Traceability для этой quality-линии становится явной без изменения `parent_change` и `producer_ref` downstream changes.
