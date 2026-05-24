## Why

Нужна отдельная релизная метка для ночной волны разбора пользовательских жалоб. Без неё новые `fix` и связанные UX/quality ideas теряются среди других параллельных changes, а связи между входящими сигналами и принятыми решениями становятся неочевидными.

## What Changes

- Создан release change `release-2026-05-24-night`.
- В релиз включена bugfix-wave по triage пользовательского документа:
  - `fix-install-onboarding-first-run-clarity`
  - `fix-task-reentry-and-reset-determinism`
  - `fix-tailwind-preview-arbitrary-values`
  - `fix-release-status-dirty-tag-warning`
  - `fix-prompt-counter-single-increment`
  - `fix-onboarding-cross-device-sync`
  - `fix-smoke-local-config-imports`
  - `fix-level-3-style-file-contract`
- Release также служит контекстной меткой для связанных ideas, поднятых из этого же документа.

## Impact

- Состав ночной волны fixes и follow-up changes становится видимым.
- Иерархия `parent_change` не меняется: release используется только как релизная метка.
