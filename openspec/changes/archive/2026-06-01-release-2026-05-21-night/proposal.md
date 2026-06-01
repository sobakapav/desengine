## Why

Нужна отдельная релизная метка для ночной волны bugfix-разбора по пользовательскому документу жалоб. Без такого release-change новые `fix` changes растворятся среди других параллельных инициатив, а связи между входящими жалобами и принятыми в работу исправлениями будут плохо видны.

## What Changes

- Создан release change `release-2026-05-21-night`.
- В релиз включён documentation-fix первого прохода установки:
  - `fix-install-onboarding-first-run-clarity`
- В релиз включены runtime и workflow bugfix changes:
  - `fix-task-reentry-and-reset-determinism`
  - `fix-tailwind-preview-arbitrary-values`
  - `fix-release-status-dirty-tag-warning`
  - `fix-prompt-counter-single-increment`
  - `fix-onboarding-cross-device-sync`
  - `fix-smoke-local-config-imports`
  - `fix-level-3-style-file-contract`
- Release фиксирует, что эти fixes происходят из единого потока triage по `dispatcher-bugfix`.

## Impact

- Становится видно, какие жалобы действительно взяты в работу в рамках одной волны.
- Иерархия `parent_change` не меняется: release используется только как метка поставки.
