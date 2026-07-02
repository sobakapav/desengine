## Миссия

- Что должен изменить этот change: Перестроить Workflow из одного project recipe в каталог проектных операций: definitions, subject scopes, artifacts, inputs/outputs и reusable templates для компонентов, экранов, данных, Storybook, миграции UI kit и системного рефакторинга.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workflow
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено:
  - workflow-line уже отделена как самостоятельная tactical линия;
  - dispatcher удерживает ownership за process-моделью, переходами и user-facing language workflow;
  - текущий приоритет линии раньше был сфокусирован на короткой цепочке `проект -> workflow -> проверка/результат`.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия: `producer-workflow`;
  - тактика и routing: `dispatcher-workflow`;
  - приёмка результата: parent owner через traceability и дальнейшую verification-волну.

## Обязательные источники

- openspec/changes/dispatcher-workflow/proposal.md
- openspec/changes/dispatcher-workflow/design.md
- openspec/changes/dispatcher-workflow/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-workflow-project-recipe-definitions-subject-scopes-artifacts-inputs:
  - openspec/specs/workflow/spec.md
  - openspec/specs/projects/spec.md
  - openspec/specs/artifacts/spec.md
  - openspec/specs/prompt-context/spec.md
  - lib/project/workspace-session.ts
  - lib/project/workflow-readout.ts
  - lib/project/component-runtime.ts
  - docs/next-steps.md
  - docs/workflow-catalog-examples.md

## Границы исполнения

- Что входит в этот change:
  - продуктовый анализ каталога workflow-примеров;
  - фиксация новой архитектурной модели workflow в OpenSpec;
  - подготовка foundation-направления для будущей реализации.
- Что сознательно не входит в этот change:
  - полный runtime engine для всех workflow;
  - browser/editor UI для редактирования workflow catalog;
  - немедленная реализация всех перечисленных workflow.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workflow остаётся project-owned слоем;
  - `Task` не возвращается как пользовательская сущность;
  - project остаётся главным рабочим контекстом продукта.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки:
  - traceability и spec-слой согласованы;
  - новая архитектура workflow выражена как продуктовый контракт, а не как ad-hoc текст в чате.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какие subject kinds являются обязательным foundation minimum;
  - нужен ли отдельный capability `workflow-catalog`;
  - какие текущие runtime структуры придётся мигрировать в первую очередь;
  - как в эту модель естественно встраиваются данные и доменная модель.
