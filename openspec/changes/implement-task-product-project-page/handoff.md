## Миссия

- Что должен изменить этот change: Убрать Task из product-пути проекта, перенести работу на уровень проекта и сделать project page главной рабочей поверхностью.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: `dispatcher-project` держит project line как главную тактическую delivery-ось и требует выравнивать цепочку работы вокруг проекта, workflow и user-facing surface.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию удерживает `focus-domain`/producer-line, тактику — `dispatcher-project`, приёмку результата выполняет внешний проверяющий агент или пользователь через интерфейс и verification layer.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-task-product-project-page:
  - openspec/specs/projects/spec.md
  - openspec/specs/workflow/spec.md
  - openspec/specs/navigation/spec.md
  - components/desengine/project/ProjectOverviewScreen.tsx
  - components/desengine/project/ProjectComponentsPanel.tsx
  - components/desengine/project/ProjectWorkflowReadoutPanel.tsx
  - components/desengine/system/Navigation.tsx

## Границы исполнения

- Что входит в этот change:
  - project-owned session/state в browser-local storage;
  - project-first workspace, workflow readout и history surface;
  - project component actions `создать`, `сделать фокусом`, `отметить как готовый`, `вернуть в работу`;
  - redirect `/tasks` и `/lab` в `/projects`;
  - обновление active OpenSpec и unit/source-contract tests под новую product-модель.
- Что сознательно не входит в этот change:
  - полное физическое удаление legacy task runtime из репозитория;
  - новый project-owned workbench/editor page;
  - server-side project session storage.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - `Project` остаётся верхним контекстом продукта;
  - `dispatcher-project` остаётся owner project-line;
  - install-critical стек не меняется.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Что именно должен доказать результат проверки: project surface действительно перестаёт зависеть от task entry path, показывает project-owned workflow/history, а source-contract tests фиксируют redirect legacy routes и новую project-first модель.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - как сделать project-first трансформацию максимально наблюдаемой через UI уже в этой волне;
  - какие task-derived панели нужно убрать сразу, а какие можно оставить как legacy за пределами project path;
  - как показать текущий рабочий фокус проекта без нового отдельного workbench route.
