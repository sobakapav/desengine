## Миссия

- Что должен изменить этот change: Сделать workflow/workbench surfaces component-aware: показывать, над каким `ProjectComponent` идёт workflow-сессия, и не сводить пользовательский контекст только к внутреннему id сессии.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workflow
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - workflow already runs from `ProjectComponent` as project-owned work;
  - project page already acts as a real entrypoint into workflow work;
  - component/workflow bridge уже удерживает project-facing смысл поверх canonical project component registry.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия принадлежит workflow-line;
  - этот implement change отвечает только за component-aware labels и user understanding inside downstream surfaces;
  - финальная приёмка выполняется внешним verification agent или пользователем.

## Обязательные источники

- openspec/changes/dispatcher-workflow/proposal.md
- openspec/changes/dispatcher-workflow/design.md
- openspec/changes/dispatcher-workflow/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workflow-component-aware-surface-labels:
  - openspec/specs/workflow/spec.md
  - openspec/specs/projects/spec.md
  - openspec/changes/implement-project-component-workflow-entrypoint/handoff.md
  - components/desengine/lab/Workbench/WorkbenchHeader.tsx
  - components/desengine/project/ProjectWorkbenchScreen.tsx
  - components/desengine/project/ProjectWorkbenchPanel.tsx
  - lib/project/component-runtime.ts
  - lib/project/component-storage.ts

## Границы исполнения

- Что входит в этот change:
  - client-side resolve `workflow-session -> ProjectComponent`;
  - component-aware labels в Workbench header;
  - component-aware labels в workflow/workbench summaries.
- Что сознательно не входит в этот change:
  - новая server-side persistence-модель компонентов;
  - новый workflow/runtime engine;
  - изменение component/workflow allocation logic.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - `ProjectComponent` уже является точкой входа в workflow;
  - project page остаётся canonical user entrypoint.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - component-aware resolver находит нужный `ProjectComponent` по workflow/workbench context;
  - workflow/workbench surfaces больше не сводят контекст только к внутреннему id;
  - деградация без найденного компонента остаётся безопасной.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - как провести component-aware context в workflow/workbench surfaces без новой persistence-модели;
  - какие labels нужны пользователю прежде всего;
  - какие unit-контракты достаточно явно защитят эту смысловую связку.
