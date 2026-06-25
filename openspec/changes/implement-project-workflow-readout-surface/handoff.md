## Миссия

- Что должен изменить этот change: проявить workflow проекта как отдельный наблюдаемый пользовательский слой без переоткрытия underlying orchestration и runtime bindings.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: workflow layer уже проектно-осведомлён в runtime, а Workbench summary уже умеет показать минимальную связку; этой волне нужно поднять это в project-facing read-only surface.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, scope этой волны удерживает `dispatcher-project`, финальную приёмку делает внешний проверяющий агент.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- `openspec/specs/projects/spec.md`
- `openspec/specs/workflow/spec.md`
- `openspec/specs/workbench/spec.md`
- `lib/task/projection.ts`
- `lib/project/workflow-readout.ts`
- `components/desengine/lab/Workbench/workbenchSurface.ts`
- `components/desengine/lab/Workbench/WorkbenchSurfaceSummary.tsx`
- `components/desengine/project/ProjectWorkflowReadoutPanel.tsx`

## Границы исполнения

- Что входит в этот change: read-only workflow/readout проекта, artifacts и bindings surface на пользовательском уровне.
- Что сознательно не входит в этот change: редактирование workflow, изменение orchestration, новый workflow engine и project history/config editor.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: project-aware workflow runtime, task/workbench bindings и canonical project boundary уже заданы существующими project-wave changes.

## Проверка результата

- verification_level: static/contract + unit
- verification_command: `npm run test:traceability && npm run test:unit -- project-workflow-readout-surface`
- Что именно должен доказать результат проверки: workflow/artifact readout оформлен как самостоятельный project-facing contract, использует существующую project-aware projection и не смешан с history/config волнами.

## Открытые вопросы

- Какой минимальный набор artifacts и bindings достаточно показать пользователю, чтобы не перегрузить первую read-only реализацию.
