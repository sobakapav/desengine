## Миссия

- Что должен изменить этот change: Выделить project-scoped shell текущего Workbench: вынести project loading/settings/migration UI и project-aware rehydrate/select/create flow в отдельные модули, чтобы Workbench стал явным consumer project scope вместо лабораторного монолита.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workbench
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: Workbench признан отдельной сущностью и целевой рабочей поверхностью; он должен жить в связке `project -> task -> workflow -> workbench`, а текущий lab workbench — лишь первый частный случай этой линии.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `producer-workbench`, тактический owner этого runtime-среза — `dispatcher-workbench`, приёмку результата и внешний verification выполняет родительский агент.

## Обязательные источники

- openspec/changes/dispatcher-workbench/proposal.md
- openspec/changes/dispatcher-workbench/design.md
- openspec/changes/dispatcher-workbench/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workbench-project-scope-shell:
  - openspec/specs/workbench/spec.md
  - components/desengine/lab/Workbench/WorkbenchView.tsx
  - components/desengine/lab/Workbench/useWorkbenchController.ts
  - components/desengine/lab/Workbench/useWorkbenchPersistence.ts
  - components/desengine/lab/Workbench/useWorkbenchTaskActions.ts
  - tools/quality-text/waivers.json
  - openspec/changes/release-2026-06-10-architecture/release-notes.md

## Границы исполнения

- Что входит в этот change:
  - вынести project-scoped shell текущего Workbench в отдельные модули;
  - отделить project loading/settings/migration UI от остального Workbench view;
  - отделить project-aware rehydrate/select/create/migration flow от общего Workbench controller;
  - сократить architectural/quality debt в `WorkbenchView.tsx` и `useWorkbenchController.ts` без изменения наблюдаемой project-aware semantics.
- Что сознательно не входит в этот change:
  - перепридумывание модели `ProjectWorkspace` или active project storage;
  - отдельная workflow-навигация и новые workflow step semantics;
  - redesign всего Workbench UI или массовая декомпозиция всех соседних модулей.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - project scope остаётся входным контрактом Workbench, а не побочным local state;
  - Workbench остаётся consumer project/task/workflow контекста, а не owner project-модели;
  - change должен оставаться узким workbench-shell refactor, а не переезжать в ownership `dispatcher-project`.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/task-project-client-boundary.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/ui-kit-switcher-visibility.test.ts test/unit/workbench-platform-registry.test.ts
- Что именно должен доказать результат проверки: выделение project-scope shell не ломает project-aware open/start/save/select/migration boundaries и сохраняет workbench/runtime контракты при более явной модульной границе.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - где проходит минимальная seam между project shell и остальным Workbench, чтобы не тянуть за собой workflow-навигацию;
  - какие unit/source-контракты стоит обновить или добавить для нового shell boundary;
  - какие waiver-записи можно снять или сузить после декомпозиции.

## Что реализовано

- Project-boundary UI вынесен из `WorkbenchView.tsx` в новый модуль `components/desengine/lab/Workbench/WorkbenchProjectShell.tsx`:
  - `WorkbenchProjectLoadingState`
  - `WorkbenchProjectSettings`
  - `WorkbenchProjectMigrationStatus`
- Project-aware shell flow вынесен из `useWorkbenchController.ts` в новый модуль `components/desengine/lab/Workbench/useWorkbenchProjectScope.ts`:
  - `useProjectController`
  - `useWorkbenchProjectScope`
  - `rehydrateTaskScope`, project select/create и migration wiring остались в workbench-линии и не были перенесены в ownership `dispatcher-project`.
- `useWorkbenchController.ts` оставлен как тонкий orchestrator Workbench-уровня: hint/save/prompt/actions + подключение выделенного project scope.

## Что важно проверить внешне

- Наблюдаемая project-aware семантика не изменилась:
  - select/create active project по-прежнему сохраняют dirty state перед переключением;
  - rehydrate после select/create по-прежнему сбрасывает active screen на `component`;
  - project migration по-прежнему идёт через тот же service boundary и завершает invalidation текущего уровня.
- Source-контракты обновлены под новый seam:
  - `test/unit/project-ui-kit-switching.test.ts`
  - `test/unit/ui-kit-switcher-visibility.test.ts`
- Из `tools/quality-text/waivers.json` удалены waiver-записи для:
  - `components/desengine/lab/Workbench/WorkbenchView.tsx`
  - `components/desengine/lab/Workbench/useWorkbenchController.ts`
  Это оправдано фактическим разбиением: `WorkbenchView.tsx` сокращён до 495 строк, `useWorkbenchController.ts` — до 125 строк.

## Локальная проверка исполнителя

- Выполнена только разрешённая sanity-проверка:
  - `npm run test:unit -- test/unit/task-project-client-boundary.test.ts test/unit/project-ui-kit-switching.test.ts test/unit/ui-kit-switcher-visibility.test.ts test/unit/workbench-platform-registry.test.ts`
- Результат:
  - `4` test files passed
  - `29` tests passed
