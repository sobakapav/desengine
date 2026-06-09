## Миссия

- Зафиксировать active release `release-2026-06-02-quality` как under-the-hood quality-волну для speed/load, preview/runtime hardening, regression harness и связанных bugfix changes.
- Этот change не меняет код и не принимает архитектурные решения за dispatcher; он фиксирует состав quality-волны и release traceability без прямых UI/UX-change.

## Унаследованный контекст

- parent_change: (не задан)
- strategy_root: (не задан)
- release_ref: (не задан)
- producer_ref: (не задан)
- Что уже решено: `producer-speed-and-load` уже определил downstream delivery-срез для `npm run start`, а downstream quality fixes вокруг preview/runtime и release tooling уже выделены в отдельные implement/fix changes. В том числе OpenSpec-fixes из `dispatcher-openspec` входят в этот under-the-hood quality-контур и требуют общей релизной метки.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию speed/load держит `producer-speed-and-load`, тактику остальных downstream delivery держат соответствующие dispatcher-линии, а release фиксирует только состав волны.

## Обязательные источники

- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- metadata и proposal всех changes, которые получают `release_ref=release-2026-06-02-quality`
- Какие ещё файлы и спецификации обязательны к чтению для release-2026-06-02-quality: `openspec/changes/implement-workbench-preview-payload-budgeting/proposal.md`, `openspec/changes/implement-runtime-task-load-guardrails/proposal.md`, `openspec/changes/implement-runtime-llm-payload-budgets/proposal.md`, `openspec/changes/implement-test-performance-budget-verdicts/proposal.md`, `openspec/changes/implement-test-speed-load-regression-harness/proposal.md`, `openspec/changes/implement-runtime-speed-observability/proposal.md`, `openspec/changes/fix-browser-webcrypto-insecure-context/proposal.md`, `openspec/changes/fix-monaco-cancellation-noise/proposal.md`, `openspec/changes/fix-preview-radix-slot-runtime/proposal.md`, `openspec/changes/fix-preview-contract-review-gaps/proposal.md`, `openspec/changes/implement-test-real-onboarding-smoke-contract/proposal.md`, `openspec/changes/fix-release-notes-close-sync/proposal.md`, `openspec/changes/fix-release-close-active-members-guard/proposal.md`, `openspec/changes/fix-release-members-kind/proposal.md`, `openspec/changes/fix-release-link-sync/proposal.md`

## Границы исполнения

- Что входит в этот change: создание релизной метки и фиксация состава under-the-hood quality-волны.
- Что сознательно не входит в этот change: реализация downstream changes, смена их `parent_change` или producer/dispatcher topology, расширение релиза на прямые UI/UX changes.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: технические границы preview/runtime/LLM paths уже принадлежат соответствующим implement/fix changes и их dispatcher-линиям.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: release change корректно оформлен, весь under-the-hood quality-набор, включая fix changes из `dispatcher-openspec`, ссылается на него через `release_ref`, а `parent_change` и `producer_ref` downstream changes не разорваны.

## Открытые вопросы

- Нужно ли позже добавлять в этот же release новые under-the-hood quality changes, если quality-волна продолжит расти до следующего релизного среза.
