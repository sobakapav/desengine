## Миссия

- Что должен изменить этот change: ввести canonical `ProjectWorkspace`, project registry, active project context и storage boundary так, чтобы `Project` действительно появился в системе как новая product boundary.
- Этот change реализует foundation project mode и не закрывает собой весь task/workflow/workbench binding.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: `dispatcher-project` уже развёл project-wave на workspace boundary, task binding, workflow binding, workbench binding и тяжёлую migration `UI kit`; `producer-architecture-transform` требует явного canonical shape и boundary.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, тактику первой project-wave держит `dispatcher-project`, итоговую приёмку выполняет внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-project/proposal.md`
- `openspec/changes/producer-project/proposal.md`
- `openspec/changes/producer-project/design.md`
- `openspec/changes/producer-architecture-transform/proposal.md`
- `openspec/specs/projects/spec.md`
- `openspec/specs/storage-adapter/spec.md`
- `openspec/specs/level-labs/spec.md`

## Границы исполнения

- Что входит в этот change: canonical `ProjectWorkspace`, registry, active project context, project settings boundary и storage adapter boundary.
- Что сознательно не входит в этот change: глубокая project-scoped миграция task/workflow/workbench/progress, `Project Roadmap`, project-level integrations `LLM`/`Figma`/`Git`.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: первая волна уже ограничена MVP project mode без roadmap; `Project` должен появиться как новый верхний контекст, а не как локальный preview-state.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: canonical project boundary описана в OpenSpec без shape drift; реализация обязана дополнительно подтвердить unit/integration/browser слои, если затронут соответствующий runtime/UI.

## Открытые вопросы

- Где именно будет жить минимальный create/select UX active project в первой реализации.
- Нужен ли compatibility-слой для старых локальных preview settings и как долго он должен поддерживаться.
