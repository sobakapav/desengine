## Миссия

- Что должен изменить этот change: Материализовать project-aware workbench shell без допуска к реальной работе: generic workbench entity, session bindings к project/workflow/subject, project surface и locked route для прощупывания верстаков.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workbench
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-workbench
- Что из родительского change уже решено:
  - workbench признан отдельной продуктовой линией, а не локальной деталью одного экрана;
  - project остаётся главным пользовательским контекстом продукта;
  - старый task-центричный путь больше не должен определять новый пользовательский контракт;
  - tool-rich и layout-rich workbench нельзя открывать раньше, чем появится стабильный shell-контур.
- Кто отвечает за стратегию, тактику и приёмку результата:
  - стратегия: `producer-workbench`;
  - тактическая рамка и routing: `dispatcher-workbench`;
  - приёмка: parent owner и следующий verification-агент через traceability и review active specs.

## Обязательные источники

- openspec/changes/dispatcher-workbench/proposal.md
- openspec/changes/dispatcher-workbench/design.md
- openspec/changes/dispatcher-workbench/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для implement-project-aware-workbench-shell-generic-workbench-entity-session:
  - openspec/specs/projects/spec.md
  - openspec/specs/workflow/spec.md
  - openspec/specs/workbench-tools/spec.md
  - openspec/specs/architecture-roadmap/spec.md
  - openspec/changes/producer-workbench/proposal.md
  - openspec/changes/producer-workbench/design.md

## Границы исполнения

- Что входит в этот change:
  - заполнение implement-change артефактов на русском без плейсхолдеров;
  - создание active capability `workbench`, если его ещё нет;
  - минимальная синхронизация capability `projects` и `workflow` под project-aware workbench shell;
  - фиксация locked-режима как единственного допустимого состояния первой materialization-волны;
  - application code для materialized workbench shell на project page;
  - locked route просмотра отдельного workbench-session;
  - unit/source-contract тесты для нового project-facing слоя.
- Что сознательно не входит в этот change:
  - типы верстаков;
  - открытие реальной пользовательской работы на верстаке;
  - возврат task-лексикона в новый контракт.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - workbench развивается как project-aware слой;
  - project важнее component-local и legacy-local моделей;
  - workflow остаётся project-owned процессом;
  - старые runtime/legacy сущности не должны возвращаться как пользовательские anchors новой архитектуры.

## Проверка результата

- verification_level: static/contract
- verification_command: npm run test:unit -- test/unit/project-workbench-surface.test.ts
- Что именно должен доказать результат проверки:
  - active specs согласованно описывают materialized workbench shell;
  - workbench привязан к project/workflow/subject и остаётся locked;
  - project page и locked route действительно материализуют workbench как новый product layer;
  - новый слой не возвращает task-модель в пользовательский путь.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - какой минимальный набор требований нужен, чтобы workbench уже был виден как ценная сущность;
  - как связать workbench с workflow без открытия преждевременной runtime-сложности;
  - какие capability достаточно обновить сейчас, чтобы downstream implementation не спорила с OpenSpec;
  - как сохранить общий shell generic, не скатываясь в ранний список типов верстаков.
