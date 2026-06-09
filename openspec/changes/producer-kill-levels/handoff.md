## Миссия

- Что должен изменить этот change: закрепить controlled transition away from `level-labs`, не допустить раннего демонтажа без заменяющей модели и передать нужный контекст соседним producer-линиям.
- Этот change не меняет код напрямую и не создаёт отдельный dispatcher.

## Унаследованный контекст

- parent_change: focus-domain
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-domain` держит стратегию доменных сущностей; producer-волны Workbench и Workflow становятся заменяющим контуром.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию controlled dismantling держит `producer-kill-levels`, тактическая реализация дальше пойдёт через соседние dispatcher/implement changes, приёмка идёт через traceability.

## Обязательные источники

- openspec/changes/focus-domain/proposal.md
- openspec/specs/level-labs/spec.md
- openspec/specs/workbench/spec.md
- openspec/specs/workflow/spec.md
- openspec/specs/task/spec.md
- openspec/specs/projects/spec.md
- openspec/changes/producer-workbench/proposal.md
- openspec/changes/producer-workflow/proposal.md

## Границы исполнения

- Что входит в этот change: legacy-статус level-модели, правила controlled dismantling, readiness criteria и связь с соседними producer-линиями.
- Что сознательно не входит в этот change: кодовое удаление route, миграция runtime и детальный UX нового контура.

## Критерии перехода к реализации

- Описана заменяющая схема `project -> task -> workflow -> workbench`.
- Зафиксировано, что нельзя удалять level-модель раньше новой рабочей логики.
- Понятно, какие downstream changes будут переносить legacy-contracts в новые сущности.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: producer корректно встроен в `focus-domain`, не подменяет соседние producer-линии и даёт ясные guardrails для controlled dismantling.
