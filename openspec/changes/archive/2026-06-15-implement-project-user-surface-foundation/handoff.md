## Миссия

- Что должен изменить этот change: открыть самостоятельный user-facing раздел проектов через верхнюю навигацию и route-слой `/projects`, чтобы проект перестал быть скрытым только внутри Workbench конкретной задачи.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: `dispatcher-project` уже признал project registry, active project context и project boundary постоянной тактической зоной ответственности; foundation/runtime часть уже существует в продукте, но user-facing project entrypoint почти не проявлен.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию project-линии держит `producer-project`, тактику очередной волны держит `dispatcher-project`, итоговую приёмку выполняет внешний проверяющий агент.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- `openspec/changes/producer-project/proposal.md`
- `openspec/specs/projects/spec.md`
- `components/desengine/system/Navigation.tsx`
- `lib/project/storage.ts`
- `lib/project/runtime.ts`
- `components/desengine/lab/Workbench/WorkbenchProjectShell.tsx`

## Границы исполнения

- Что входит в этот change: project navigation helpers, верхняя вкладка `Проекты`, самостоятельные pages `/projects` и `/projects/[projectId]`, project overview и чтение registry как отдельного пользовательского surface.
- Что сознательно не входит в этот change: task assignment UX, JSON-редактор проекта, расширенная project history, workflow/artifact readout, migration replay UX и backend-синхронизация project registry.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: canonical `ProjectWorkspace`, active project boundary, task/workflow/workbench project-aware runtime и тяжёлая `UI kit` migration уже заданы существующей project-line.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: capability `projects` получил явный user-facing contract для навигации и project pages, а реализация не смешала foundation project boundary с task-assignment или config-волной.

## Открытые вопросы

- Эта волна сознательно ограничена чтением registry и переходом в карточку проекта; create/select остаётся для следующих project-facing changes.
- Для foundation-страниц достаточно переиспользовать существующий browser storage boundary без отдельного backend-слоя.

## Что подготовлено исполнителем

- Добавлены canonical routes `getProjectsRootUrl()` и `getProjectUrl(projectId)`.
- В глобальную навигацию подключена вкладка `Проекты`.
- Подняты страницы `/projects` и `/projects/[projectId]` с client-side чтением project registry и базовым overview проекта.
- Обновлён active spec `openspec/specs/projects/spec.md` и добавлен unit/source-contract harness для нового user-facing surface.
