## Миссия

- Что должен изменить этот change: Сделать карточки компонентов проекта полноценной точкой продолжения workflow-сессии: показать статус, последнюю активность, прогресс и корректное действие повторного входа.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - project page уже принята как canonical project-facing user surface;
  - `ProjectComponent` уже существует как project-scoped сущность внутри проекта;
  - workflow-readout проекта уже загружается и показывает наблюдаемый runtime слой;
  - вход из компонента в workflow уже работает через backing task bridge.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегию и product pressure держит project-line в связке с domain-line;
  - этот implement change отвечает только за user-facing session status surface на карточке компонента;
  - финальную приёмку выполняет внешний verification agent или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-component-session-status-surface:
  - openspec/specs/projects/spec.md
  - openspec/specs/workflow/spec.md
  - openspec/changes/implement-project-component-workflow-entrypoint/handoff.md
  - openspec/changes/implement-project-workflow-readout-surface/design.md
  - app/projects/[projectId]/page.tsx
  - components/desengine/project/ProjectOverviewScreen.tsx
  - components/desengine/project/ProjectComponentsPanel.tsx
  - components/desengine/project/projectSurface.ts
  - lib/project/workflow-readout.ts

## Границы исполнения

- Что входит в этот change:
  - привязка `ProjectComponent` card к уже загруженному workflow readout по `taskId`;
  - показ статуса сессии, последней активности и прогресса прямо на карточке компонента;
  - user-facing текст `Продолжить работу` для повторного входа в уже начатую сессию.
- Что сознательно не входит в этот change:
  - новый runtime engine;
  - новая storage-модель компонентов;
  - серверная агрегация component/session registry;
  - полное удаление concept `task` из внутренних связей.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - project page остаётся canonical точкой входа для project-facing user path;
  - backing task bridge остаётся рабочей моделью текущей волны;
  - отдельный `ProjectWorkflowReadoutPanel` сохраняется как расширенный наблюдаемый слой.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - карточка компонента строит корректный session-readout для draft/start/continue состояний;
  - project-facing surface использует `workflowReadout` и показывает `Продолжить работу`, когда сессия уже существует;
  - деградация без runtime-readout остаётся безопасной и не мешает открыть workflow.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какой минимальный набор session-данных нужен пользователю прямо на карточке;
  - где провести границу между component card и большим workflow-readout блоком;
  - какие unit-контракты достаточно явно защитят этот новый user path.
