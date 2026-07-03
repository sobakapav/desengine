## Миссия

- Что должен изменить этот change: закрепить Workbench как materialized, но пока locked рабочую поверхность продукта, описать схему `project -> workflow -> workbench` с явным `subject` и передать tactical ownership существующему `dispatcher-workbench`.
- Этот change не меняет код напрямую и не подменяет downstream dispatcher/implement ветки.

## Унаследованный контекст

- parent_change: focus-domain
- strategy_root: focus-domain
- release_ref: (не задан)
- producer_ref: (не задан)
- Что из родительского change уже решено: `focus-domain` уже является стратегическим фокусом доменных сущностей; `dispatcher-workbench` уже держит тактическую линию контракта Workbench.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию Workbench как доменной сущности держит `producer-workbench`, tactical ownership продолжает держать `dispatcher-workbench`, приёмка идёт через traceability и последующую постановку downstream changes.

## Обязательные источники

- openspec/changes/focus-domain/proposal.md
- openspec/changes/focus-domain/roadmaps/workbench.md
- openspec/changes/dispatcher-workbench/proposal.md
- openspec/changes/dispatcher-workbench/design.md
- openspec/specs/workbench/spec.md
- openspec/specs/workflow/spec.md
- openspec/specs/projects/spec.md
- openspec/specs/level-labs/spec.md

## Границы исполнения

- Что входит в этот change: producer-рамка Workbench, схема следующего рабочего контура, критерии readiness и связь с отказом от лабораторной модели.
- Что сознательно не входит в этот change: прямой код нового Workbench, детальный vertical workflow и routing cleanup как самодостаточная цель.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: `dispatcher-workbench` уже владеет тактическим backlog WorkbenchDefinition/Instance, registry и tool families.

## Критерии перехода к реализации

- Workbench описан как самостоятельная materialized поверхность, доступная пока только в locked-режиме.
- Описана связь Workbench с `project`, `workflow` и `subject`.
- Понятно, какие downstream changes являются foundation, а какие — vertical workflow slices.
- Зафиксировано, что `level-labs` не являются долгосрочной целевой моделью.

## Проверка результата

- verification_level: static
- verification_command: npm run test:traceability
- Что именно должен доказать результат проверки: producer корректно встроен в `focus-domain`, не дублирует `dispatcher-workbench` и даёт ясную стратегическую рамку следующей волны.
