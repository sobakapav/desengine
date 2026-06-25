## Миссия

- Что должен изменить этот change: Сделать ProjectComponent реальной точкой входа в workflow: назначать backing task, запускать image-to-component flow из страницы проекта и давать пользователю действие 'Работать над компонентом'.
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
  - components/desengine/project/useProjectComponents.ts
  - lib/project/component-runtime.ts
  - lib/project/component-storage.ts
  - lib/task/actions/start.ts
  - lib/task/project-runtime-scope.ts
  - lib/task/server.ts

## Границы исполнения

- Что входит в этот change:
  - назначение `backing taskId` для `ProjectComponent`;
  - project-facing действие `Работать над компонентом`;
  - запуск существующего `image-to-component` flow из project page;
  - возврат в ту же workflow-сессию компонента по сохранённому backing task.
- Что сознательно не входит в этот change:
  - новый task engine;
  - server-side component catalog;
  - полная component-scoped orchestration model;
  - замена существующего Lab/Workbench runtime.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workflow остаётся основной моделью исполнения;
  - Workbench остаётся materialization workflow session;
  - project page остаётся canonical входом в project-facing user path;
  - component registry уже принят как project-scoped boundary.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - `ProjectComponent` может получить и сохранить backing task;
  - пользовательский surface показывает и использует действие `Работать над компонентом`;
  - повторный вход в компонент использует ту же workflow-сессию, а не создаёт новую случайно.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - где и как выбирать backing task без тяжёлой server-side миграции;
  - как встроить запуск workflow в текущий `ProjectComponentsPanel` без лишнего UI-шума;
  - какие unit-контракты достаточно явно докажут bridge между `ProjectComponent` и workflow runtime.
