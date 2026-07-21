## Миссия

- Что должен изменить этот change: Дать пользователю минимальный project-side production path: создавать проект из /projects, создавать в проекте компоненты как отдельные сущности и видеть их список на странице проекта.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - `ProjectWorkspace` уже зафиксирован как canonical project boundary;
  - в продукте уже существуют routes `/projects` и `/projects/<projectId>`;
  - project page уже показывает config, diagnostics, workflow readout и связанные компонентные линии;
  - project-линия должна проявляться в пользовательском мире отдельными project-facing slices, а не оставаться скрытой внутри Workbench.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия и product pressure принадлежат project-линии под `dispatcher-project`;
  - этот implement change отвечает только за минимальный project-side production path;
  - финальную приёмку результата выполняет внешний verification agent или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-component-registry-and-create-flow:
  - openspec/specs/projects/spec.md
  - components/desengine/project/ProjectsScreen.tsx
  - components/desengine/project/ProjectOverviewScreen.tsx
  - components/desengine/project/useProjectRegistry.ts
  - components/desengine/project/useProjectOverview.ts
  - lib/project/runtime.ts
  - lib/project/storage-disk.ts

## Границы исполнения

- Что входит в этот change:
  - создание нового проекта прямо из `/projects`;
  - введение canonical project-scoped сущности компонента;
  - canonical registry компонентов проекта;
  - пользовательский список компонентов на странице проекта;
  - создание нового компонента проекта с workflow `image-to-component-workflow`.
- Что сознательно не входит в этот change:
  - запуск workflow-run из компонента;
  - привязка компонента к реальной workflow-сессии или workbench runtime;
  - multi-user sync;
  - детальный editor/shell для компонента.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - `Project` остаётся верхним контейнером product/runtime topology;
  - workflow остаётся отдельным процессным слоем внутри project context;
  - project-facing slices должны нарастать поверх уже существующего project boundary, а не подменять его новой сущностью.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - пользовательский surface умеет создавать проект без захода в старый legacy flow;
  - пользовательский surface умеет создавать project component внутри проекта;
  - новый component registry не ломает existing project overview contracts.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - как назвать и хранить минимальную project-component сущность без преждевременной привязки к workflow runtime;
  - как встроить create/list flows в существующие project screens без тяжёлого UI-redesign;
  - какие unit-контракты лучше всего докажут новый пользовательский путь.
