## Миссия

- Что должен изменить этот change: Сделать ProjectComponent реальной точкой входа в workflow: запускать project-owned работу по компоненту со страницы проекта и давать пользователю действие `Взять в работу`.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workflow
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - workflow уже закреплён как отдельная process-line;
  - `image-to-component-workflow` уже существует как канонический workflow type;
  - coordinator step `Работаем над workflow` и workflow points уже проявлены в runtime и user surface;
  - project line уже проявила `ProjectComponent` как project-scoped сущность.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия и product pressure принадлежат workflow-line и domain-line;
  - этот implement change отвечает только за project-facing workflow entrypoint;
  - финальную приёмку выполняет внешний verification agent или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-workflow/proposal.md
- openspec/changes/dispatcher-workflow/design.md
- openspec/changes/dispatcher-workflow/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-component-workflow-entrypoint:
  - openspec/specs/workflow/spec.md
  - openspec/specs/projects/spec.md
  - openspec/changes/implement-project-component-registry-and-create-flow/handoff.md
  - openspec/changes/implement-workflow-image-component-foundation/design.md
  - openspec/changes/implement-workflow-point-session-control/design.md
  - components/desengine/project/ProjectComponentsPanel.tsx
  - components/desengine/project/useProjectWorkspace.ts
  - lib/project/component-runtime.ts
  - lib/project/component-storage.ts
  - lib/project/workflow-readout.ts
  - lib/project/workspace-session.ts

## Границы исполнения

- Что входит в этот change:
  - project-facing действие `Взять в работу`;
  - запуск существующего `image-to-component` flow из project page;
  - перевод компонента в активную проектную работу без отдельного runtime bridge.
- Что сознательно не входит в этот change:
  - server-side component catalog;
  - полная component-scoped orchestration model;
  - открытие полноценного unlocked Workbench.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workflow остаётся основной моделью исполнения;
  - Workbench остаётся materialization workflow session;
  - project page остаётся canonical входом в project-facing user path;
  - component registry уже принят как project-scoped boundary.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - пользовательский surface показывает и использует действие `Взять в работу`;
  - запуск работы по компоненту отражается в project-owned workflow и history;
  - пользователь не уходит в отдельный legacy runtime-маршрут.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - как встроить запуск workflow в текущий `ProjectComponentsPanel` без лишнего UI-шума;
  - какие unit-контракты достаточно явно докажут bridge между `ProjectComponent` и project-owned workflow runtime.
