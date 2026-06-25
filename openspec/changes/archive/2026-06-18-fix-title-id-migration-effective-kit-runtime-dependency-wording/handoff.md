## Миссия

- Что должен изменить этот change: Упростить пользовательский слой проекта: редактируемые title и id, явное локальное хранение, убрать migration/effective kit/runtime dependency wording/architecture transform, уточнить что workflow стартует только по кнопке компонента
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - project page уже признана canonical project-facing точкой входа;
  - project registry и `ProjectComponent` уже существуют как рабочие product сущности;
  - workflow из компонента уже запускается через отдельную кнопку и backing task bridge.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегию держит project-line в рамках focus-domain;
  - этот fix-change отвечает только за упрощение пользовательского контракта;
  - финальную приёмку выполняет внешний verification-agent или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-title-id-migration-effective-kit-runtime-dependency-wording:
  - openspec/specs/projects/spec.md
  - openspec/specs/workflow/spec.md
  - openspec/specs/storage-adapter/spec.md
  - components/desengine/project/ProjectsScreen.tsx
  - components/desengine/project/ProjectOverviewScreen.tsx
  - components/desengine/project/ProjectConfigPanel.tsx
  - components/desengine/project/ProjectComponentsPanel.tsx
  - components/desengine/project/ProjectCard.tsx
  - components/desengine/project/projectSurface.ts
  - components/desengine/project/ProjectHistoryDiagnosticsPanel.tsx
  - lib/project/runtime.ts
  - lib/project/storage.ts
  - lib/project/config-surface.ts
  - lib/task/prompt-context.ts
  - test/unit/project-config-and-ui-kit-contract.test.ts
  - test/unit/project-user-surface-foundation.test.ts

## Границы исполнения

- Что входит в этот change:
  - редактирование `title` и `id` проекта;
  - rename-safe сохранение проекта в browser registry;
  - project-facing указание на локальное хранение;
  - removal user-facing migration/effective/runtime-dependency/architecture-transform wording;
  - честная формулировка component create/start flow.
- Что сознательно не входит в этот change:
  - новый filesystem-backed project path;
  - новый server-side project storage;
  - полный рефакторинг workbench runtime project switching;
  - смена backing-task модели для компонентов.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - project page остаётся canonical user entrypoint;
  - `ProjectComponent` остаётся project-scoped сущностью;
  - workflow стартует из компонента через явное пользовательское действие.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - проект можно создать и сохранить с явным `id`;
  - project-facing surface больше не светит migration/effective/architecture-transform шум;
  - prompt-context проекта держит один выбранный UI kit;
  - component create-flow больше не вводит пользователя в заблуждение относительно автозапуска workflow.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - как безопасно сохранить проект при изменении `id`, не оставляя stale-версию в registry;
  - как показать storage location без фальшивого file path;
  - где провести границу между user-facing чисткой и существующим workbench-side runtime.
