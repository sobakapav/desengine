## Миссия

- Что должен изменить этот change: сделать onboarding/task layer project-aware сразу после foundation-слоя `ProjectWorkspace`, не смешивая это с workflow или workbench/preview binding.
- Этот change реализует второй шаг project-wave и не закрывает workflow semantics, workbench semantics или progress invalidation.

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
- `openspec/changes/producer-project/proposal.md`
- `openspec/changes/producer-project/design.md`
- `openspec/specs/task/spec.md`
- `openspec/specs/projects/spec.md`

## Границы исполнения

- Что входит в этот change: project-aware onboarding/task layer, task/opening flow внутри active project и project-aware task projection.
- Что сознательно не входит в этот change: workflow layer, `workbench` / preview binding, progress invalidation, `Project Roadmap`, project-level external integrations.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: foundation project boundary уже вводится отдельным change; producer уже вынес workflow, workbench/preview semantics и invalidation в следующие шаги.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: onboarding/task layer описан как самостоятельный project-aware шаг и не смешан с workflow или workbench/preview semantics; реализация обязана дополнительно подтвердить unit/integration/browser слои, если они затронуты.

## Открытые вопросы

- Какие user-facing task/opening surfaces обязаны стать project-aware в первой реализации этой ветки.
