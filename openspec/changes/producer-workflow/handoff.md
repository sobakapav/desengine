## Миссия

- Что должен изменить этот change: закрепить workflow как видимый производственный процесс продукта, а не скрытую проекцию уровней, и передать tactical ownership `dispatcher-workflow`.
- Этот change не меняет код напрямую и не подменяет downstream dispatcher/implement ветки.

## Унаследованный контекст

- parent_change: focus-domain
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-domain` уже держит стратегию доменных сущностей; idea-слой уже зафиксировал связь task и workflow.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию workflow как сущности держит `producer-workflow`, тактику и backlog дальше ведёт `dispatcher-workflow`, приёмка идёт через traceability и последующую постановку downstream changes.

## Обязательные источники

- openspec/changes/focus-domain/proposal.md
- openspec/changes/idea-task-and-workflow-restructuring/proposal.md
- openspec/changes/idea-task-and-workflow-restructuring/design.md
- openspec/specs/workflow/spec.md
- openspec/specs/workbench/spec.md
- openspec/specs/task/spec.md
- openspec/specs/task-model/spec.md
- openspec/specs/projects/spec.md
- openspec/specs/level-labs/spec.md

## Границы исполнения

- Что входит в этот change: producer-рамка workflow как процесса, схема связи с task/workbench/project, readiness criteria и tactical parent для downstream workflow-линии.
- Что сознательно не входит в этот change: реализация workflow engine, первый concrete workflow и детальная работа по Workbench runtime.

## Критерии перехода к реализации

- Workflow описан как first-class процесс продукта.
- Понятно, как workflow проявляется пользователю вне level-модели.
- Понятна связь с Workbench и Task.
- Создан `dispatcher-workflow` как tactical owner для следующих waves.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: producer корректно встроен в `focus-domain` и даёт ясную рамку для следующей workflow-волны.
