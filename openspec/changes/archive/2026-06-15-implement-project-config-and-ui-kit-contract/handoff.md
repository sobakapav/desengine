## Миссия

- Что должен изменить этот change: вывести project config на страницу проекта как самостоятельный пользовательский контракт, чтобы `uiKitId`, JSON-настройки и их влияние на prompt/preview были видны и управляемы вне Workbench.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: project boundary, project settings и migration status уже существуют как canonical runtime contract; workbench shell уже умеет create/select/migrate project, но отдельного project config surface у пользователя почти нет.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию держит `producer-project`, тактику волны и границы scope держит `dispatcher-project`, итоговую финальную проверку делает внешний проверяющий агент.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- `openspec/changes/producer-project/proposal.md`
- `openspec/specs/projects/spec.md`
- `openspec/specs/task/spec.md`
- `lib/project/runtime.ts`
- `lib/project/storage.ts`
- `lib/task/prompt-context.ts`
- `lib/lab/sandpack-ui-kits.config.ts`
- `components/desengine/lab/Workbench/WorkbenchProjectShell.tsx`

## Границы исполнения

- Что входит в этот change: project config page surface, JSON-редактирование как MVP-конфигурация, выбор canonical UI kit, selected/effective UI kit diagnostics и явная фиксация связи project settings с prompt/preview contract.
- Что сознательно не входит в этот change: redesign Workbench shell, глубокая project history, массовая миграция данных между проектами, backend-хранилище конфигов и внешние integrations.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: canonical project shape, active project boundary, task/workflow/workbench project-aware runtime и тяжёлая migration semantics уже решены существующей project-line.

## Проверка результата

- verification_level: static/contract
- verification_command: `npm run test:traceability`
- Что именно должен доказать результат проверки: OpenSpec явно фиксирует project config как user-facing contract, а project-level `uiKit` и prompt/preview semantics остаются частью одного canonical project source of truth.

## Открытые вопросы

- Нужна ли отдельная JSON-валидация с мягким recovery path для ручного редактирования пользователем.
- Должен ли первый config surface редактировать весь `ProjectWorkspace` или только открытое подмножество project settings.

## Реализация в этой сессии

- На странице проекта поднят рабочий config surface с редактируемым JSON для `ProjectWorkspace.settings`.
- `uiKitId` можно переключать через canonical список kit'ов; `uiMode` остаётся управляемым через JSON этого MVP-контракта.
- На странице проекта явно показаны selected/effective UI kit, migration status и read-only prompt/preview contract snapshot.
- Исполнитель выполнил только локальные проверки своего scope и не объявляет внешнюю финальную приёмку.
