## Миссия

- Зафиксировать новый active release `release-2026-06-02-quality`, чтобы три implement-change из `producer-speed-and-load` получили единый release lineage.
- Зафиксировать новый active release `release-2026-06-02-quality`, чтобы active speed/load-набор из `producer-speed-and-load` и все active потомки `dispatcher-ux` получили единый release lineage.
- Этот change не меняет код и не принимает архитектурные решения за dispatcher; он фиксирует состав quality-волны и release traceability.

## Унаследованный контекст

- parent_change: (не задан)
- strategy_root: (не задан)
- release_ref: (не задан)
- producer_ref: (не задан)
- Что уже решено: `producer-speed-and-load` уже определил downstream delivery-срез для `npm run start`, а `dispatcher-ux` уже держит активный implement-набор по UX-потоку и recovery. Их child changes уже существуют и требуют общей релизной метки.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию speed/load держит `producer-speed-and-load`, UX-тактику держит `dispatcher-ux`, тактику остальных downstream delivery держат `dispatcher-workbench`, `dispatcher-runtime` и `dispatcher-test-system`, а release фиксирует только состав волны.

## Обязательные источники

- `openspec/changes/release-2026-06-02-quality/proposal.md`
- `openspec/changes/producer-speed-and-load/roadmaps/speed-and-load.md`
- `openspec/changes/dispatcher-ux/proposal.md`
- `openspec/changes/dispatcher-ux/design.md`
- metadata и proposal всех changes, которые получают `release_ref=release-2026-06-02-quality`
- Какие ещё файлы и спецификации обязательны к чтению для release-2026-06-02-quality: `openspec/changes/implement-workbench-preview-payload-budgeting/proposal.md`, `openspec/changes/implement-runtime-task-load-guardrails/proposal.md`, `openspec/changes/implement-runtime-llm-payload-budgets/proposal.md`, `openspec/changes/implement-test-performance-budget-verdicts/proposal.md`, `openspec/changes/implement-test-speed-load-regression-harness/proposal.md`, `openspec/changes/implement-runtime-speed-observability/proposal.md`, `openspec/changes/implement-level-reset-entrypoint/proposal.md`, `openspec/changes/implement-ux-highlight-correct-solution-diff/proposal.md`, `openspec/changes/implement-ux-merge-generate-check-phases/proposal.md`, `openspec/changes/implement-ux-return-to-level-task-list/proposal.md`

## Границы исполнения

- Что входит в этот change: создание релизной метки и фиксация состава speed/load- и UX-quality-волны.
- Что сознательно не входит в этот change: реализация downstream changes, смена их `parent_change` или producer/dispatcher topology, расширение релиза на посторонние active changes.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: технические границы preview/runtime/LLM paths и UX-потоков уже принадлежат соответствующим implement changes и их dispatcher-линиям.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: release change корректно оформлен, весь speed/load- и active UX-набор ссылается на него через `release_ref`, а `parent_change` и `producer_ref` downstream changes не разорваны.

## Открытые вопросы

- Нужно ли позже добавлять в этот же release новые active UX- или speed/load changes, если quality-волна продолжит расти до следующего релизного среза.
