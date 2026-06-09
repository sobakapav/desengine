## Tasks

- [x] 1. Создать active release `release-2026-06-02-quality`.
- [x] 2. Привязать к нему active under-the-hood quality changes через `release_ref`:
  - [x] 2.1 `implement-workbench-preview-payload-budgeting`
  - [x] 2.2 `implement-runtime-task-load-guardrails`
  - [x] 2.3 `implement-runtime-llm-payload-budgets`
  - [x] 2.4 `implement-test-performance-budget-verdicts`
  - [x] 2.5 `implement-test-speed-load-regression-harness`
  - [x] 2.6 `implement-runtime-speed-observability`
  - [x] 2.7 `fix-browser-webcrypto-insecure-context`
  - [x] 2.8 `fix-monaco-cancellation-noise`
  - [x] 2.9 `fix-preview-radix-slot-runtime`
  - [x] 2.10 `implement-test-real-onboarding-smoke-contract`
  - [x] 2.11 `fix-release-notes-close-sync`
  - [x] 2.12 `fix-release-close-active-members-guard`
  - [x] 2.13 `fix-release-members-kind`
  - [x] 2.14 `fix-release-link-sync`
  - [x] 2.15 `fix-preview-contract-review-gaps`
- [x] 3. Зафиксировать явный состав release в proposal/README/release-notes и убрать устаревшую UX-привязку из предыдущего release.
- [x] 4. Выполнить внешнюю static/contract-проверку release-lineage.

## Тестовая часть change

Затронутые OpenSpec capability/scenarios:
- `admin-tools`: release change используется как релизная метка поставки, а downstream changes ссылаются на него через `release_ref`.

Уровни проверки:
- static/contract: обязательный.
- unit: не требуется.
- component/browser: не требуется.
- integration: не требуется.
- e2e smoke: не требуется.
- live/provider: не требуется.

Команды запуска:
- `npm run test:traceability`

Mock/fixture-данные и credentials:
- Не нужны.

Примечание по верификации:
- Финальную проверку и формулировку результата выполняет внешний проверяющий агент или пользователь.
