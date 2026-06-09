## Миссия

- Что должен изменить этот change: сделать workflow layer project-aware сразу после foundation и onboarding/task layer, сохранив workflow отдельным процессом решения.
- Этот change реализует третий шаг project-wave и не закрывает `workbench` semantics или progress invalidation.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: `dispatcher-project` уже разделил первую волну на foundation, onboarding/task layer, workflow layer, workbench/preview binding и progress invalidation; `producer-project` требует именно такую поэтапность.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, тактику первой project-wave держит `dispatcher-project`, итоговую приёмку выполняет внешний проверяющий.

## Обязательные источники

- `openspec/changes/dispatcher-project/proposal.md`
- `openspec/changes/implement-project-workspace-mvp/proposal.md`
- `openspec/changes/implement-project-task-onboarding-binding/proposal.md`
- `openspec/changes/producer-project/proposal.md`
- `openspec/changes/producer-project/design.md`
- `openspec/specs/workflow/spec.md`
- `openspec/specs/projects/spec.md`

## Границы исполнения

- Что входит в этот change: project-aware workflow layer, workflow projection внутри active project и явный process-layer между task и `workbench`.
- Что сознательно не входит в этот change: `workbench` / preview binding, progress invalidation, `Project Roadmap`, project-level external integrations.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: foundation project boundary и task-layer уже вводятся отдельными changes; workflow не должен растворяться в них или забирать ownership у `workbench`.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: workflow layer описан как самостоятельный project-aware шаг и не смешан ни с task-layer, ни с workbench semantics; реализация обязана дополнительно подтвердить unit/integration/browser слои, если они затронуты.

## Открытые вопросы

- Какие user-facing workflow surfaces обязаны стать project-aware в первой реализации этой ветки.
