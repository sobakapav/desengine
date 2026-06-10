## Миссия

- Что должен изменить этот change: Устранить hydration mismatch в project-aware Workbench из-за updatedAt на сервере и клиенте
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: project-aware Workbench уже показывает active project, project registry и метаданные workspace; этот fix не меняет create/select boundary и не переоткрывает project-scoped runtime.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию и приоритет project-линии держит `dispatcher-project`, а итоговую приёмку результата выполняет внешний проверяющий.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-project-workbench-updated-at-hydration: `components/desengine/lab/Workbench/WorkbenchView.tsx`, `openspec/specs/workbench/spec.md`, `openspec/specs/projects/spec.md`, связанные unit/source-contract tests Workbench.

## Границы исполнения

- Что входит в этот change: устранить hydration mismatch вокруг отображения `project.updatedAt` в Workbench UI, при необходимости обновить точечные project/workbench tests и bookkeeping релиза.
- Что сознательно не входит в этот change: изменение project storage/runtime shape, create/select flow, migration flow, task/workflow binding и любые toolchain- или wrapper-fixes.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: canonical `ProjectWorkspace`, active project boundary и project-aware Workbench уже приняты как foundation и этим fix не пересматриваются.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: Workbench больше не формирует заведомо нестабильный SSR/CSR output для `updatedAt`, а точечные tests подтверждают стабильный render contract или безопасный client-only display path.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: нужен ли полный отказ от SSR-formatting `updatedAt` или достаточно отложить локализованный timestamp до client hydration без пользовательского мигания и ложного mismatch.
