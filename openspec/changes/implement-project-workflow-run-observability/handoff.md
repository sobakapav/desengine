## Миссия

- Что должен изменить этот change: Проявить workflow-run как project-facing сущность: наблюдаемость runs, пунктов workflow и связанных артефактов на странице проекта.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - проект является самостоятельным user-facing контейнером;
  - project page уже показывает config, diagnostics, task bindings и базовый workflow readout;
  - workflow внутри проекта должен читаться как часть общего project boundary, а не как скрытый task-local runtime.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия и product pressure принадлежат project-line и domain-line;
  - этот implement change отвечает только за кодовое проявление workflow-run observability;
  - финальная приёмка идёт через внешнюю verification-проверку и пользователя.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-workflow-run-observability:
  - openspec/specs/projects/spec.md
  - openspec/specs/workflow/spec.md
  - openspec/changes/implement-project-workflow-readout-surface/specs/projects/spec.md
  - lib/project/workflow-readout.ts
  - components/desengine/project/ProjectWorkflowReadoutPanel.tsx
  - components/desengine/project/projectSurface.ts
  - test/unit/project-workflow-readout-surface.test.ts

## Границы исполнения

- Что входит в этот change:
  - показать workflow-run как project-facing сущность;
  - добавить наблюдаемость пунктов workflow и последней активности;
  - усилить объяснимость связи run, artifacts и Workbench.
- Что сознательно не входит в этот change:
  - writable управление run;
  - отдельная persistence-модель workflow runs;
  - новый orchestration engine.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - project page уже считается canonical входом в project boundary;
  - workflow остаётся основной моделью процесса;
  - Workbench остаётся materialization слоя работы, а не единственной сущностью процесса.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки:
  - project workflow surface показывает run-observability, а не только current step;
  - пользовательская модель читает пункты workflow и последнюю активность;
  - page wiring остаётся project-facing и не уводит пользователя в task/workbench flow.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какой минимальный run-shape можно вывести без нового storage;
  - как показать пункты workflow понятно и без перегрузки project page;
  - как вывести последнюю активность из уже доступных runtime данных.
