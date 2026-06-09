## Миссия

- Что должен изменить этот change: сделать `workbench` и preview semantics частью project contract после foundation, onboarding/task layer и отдельного workflow-layer.
- Этот change реализует четвёртый шаг project-wave и не закрывает progress invalidation.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: `dispatcher-project` уже развёл первую волну на foundation, onboarding/task layer, workflow layer, workbench/preview binding и progress invalidation; `producer-architecture-transform` требует не смешивать разные boundaries в одну сущность.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, тактику первой project-wave держит `dispatcher-project`, итоговую приёмку выполняет внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-project/proposal.md`
- `openspec/changes/implement-project-workspace-mvp/proposal.md`
- `openspec/changes/implement-project-task-onboarding-binding/proposal.md`
- `openspec/changes/implement-project-workflow-binding/proposal.md`
- `openspec/changes/producer-project/design.md`
- `openspec/changes/producer-architecture-transform/design.md`
- `openspec/specs/workbench/spec.md`
- `openspec/specs/level-labs/spec.md`

## Границы исполнения

- Что входит в этот change: project-scoped workbench/preview semantics и project-aware lab flow.
- Что сознательно не входит в этот change: workflow binding, progress invalidation, `Project Roadmap`, повторное определение task-layer.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: foundation, task-layer и workflow-layer already separated; этот change не забирает их ownership.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: workbench/preview binding описан как отдельный шаг после task-layer и workflow-layer; реализация обязана дополнительно подтвердить unit/integration/browser слои, если они затронуты.

## Открытые вопросы

- Какие части текущего lab UX должны остаться совместимыми во время перехода на project-scoped workbench semantics.
