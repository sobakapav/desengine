## Миссия

- Что должен изменить этот change: Довести следующий пользовательский слой project workflow: пользователь создаёт проект, задаёт title и id, видит локальное хранение, затем создаёт в проекте несколько компонентов и из каждого компонента может явно запустить или продолжить workflow image-to-component через рабочую сессию без ручного поиска task/workbench.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - project page уже признана canonical точкой входа в project-aware пользовательский слой;
  - `ProjectWorkspace` и `ProjectComponent` уже проявлены как реальные продуктовые сущности;
  - workflow для компонента уже привязывается к `image-to-component-workflow` и стартует только явным действием пользователя;
  - базовый readout workflow и task-binding уже доступны на странице проекта.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - продуктовый смысл project line удерживает `producer-project`;
  - тактическую координацию этой линии держит `dispatcher-project`;
  - этот implement-change отвечает только за следующий пользовательский слой поверх уже существующих project/workflow surfaces;
  - финальную приёмку выполняет внешний verification-agent или пользователь.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-workflow-title-id-workflow-image-to-component:
  - openspec/specs/projects/spec.md
  - openspec/specs/workflow/spec.md
  - openspec/changes/implement-project-component-registry-and-create-flow/handoff.md
  - openspec/changes/implement-project-component-workflow-entrypoint/handoff.md
  - components/desengine/project/ProjectsScreen.tsx
  - components/desengine/project/ProjectOverviewScreen.tsx
  - components/desengine/project/ProjectComponentsPanel.tsx
  - components/desengine/project/useProjectRegistry.ts
  - components/desengine/project/useProjectComponents.ts
  - components/desengine/project/projectSurface.ts
  - lib/project/storage.ts
  - lib/project/component-storage.ts
  - lib/task/assignment-server.ts
  - test/unit/project-user-surface-foundation.test.ts
  - test/unit/project-component-registry-surface.test.ts

## Границы исполнения

- Что входит в этот change:
  - сделать путь из project registry в конкретный проект более прямым и явным;
  - сделать страницу проекта понятной как рабочую точку для создания нескольких компонентов;
  - усилить CTA и пользовательские пояснения вокруг запуска и продолжения workflow из карточек компонентов;
  - обновить OpenSpec и unit-contracts под этот пользовательский слой.
- Что сознательно не входит в этот change:
  - новый storage backend или file-system path проекта;
  - новый workflow engine или новая routing-модель вместо lab session;
  - полный redesign task screen и workbench;
  - выделение отдельной component-scoped orchestration model.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - project остаётся canonical контейнером верхнего уровня;
  - workflow остаётся основной моделью исполнения;
  - `image-to-component-workflow` остаётся базовым workflow type для этой волны;
  - underlying task/workbench runtime не перепридумывается в рамках этого change.

## Проверка результата

- verification_level: unit
- verification_command: npx vitest run --project unit test/unit/project-user-surface-foundation.test.ts test/unit/project-component-registry-surface.test.ts test/unit/project-config-and-ui-kit-contract.test.ts
- Что именно должен доказать результат проверки:
  - пользователь видит в registry прямой следующий шаг после создания проекта;
  - страница проекта проявляет проект как контейнер для нескольких компонентов;
  - карточки компонентов дают явный и повторно используемый вход в workflow-сессию;
  - source-contracts и surface-модели согласованы с обновлённым пользовательским путём.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - где лучше провести явную границу между `создать проект` и `сразу начать работу внутри проекта`;
  - какие project-facing сигналы реально помогают при нескольких компонентах, а какие только раздувают UI;
  - какие формулировки достаточно честно описывают текущий runtime без обещаний несуществующего component-native engine.
