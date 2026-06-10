## Миссия

- Что должен изменить этот change: Убрать свежий quality:text блокер в lib/workbench/lab-profile.ts: добавить содержательный @example для нетривиального экспортируемого API, чтобы релизная wave снова проходила test:full после implement-workbench-task-workflow-surface.
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-workbench
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: (не задан)
- Что из родительского change уже решено: Workbench-line уже получила producer-контекст и свежий surface-step, но релиз снова упёрся в quality gate из-за одного нового экспортируемого API без `@example`.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегический смысл линии удерживает `producer-workbench`, tactical эксплуатационный хвост чинится под `dispatcher-workbench`, внешний verification и приёмку выполняет родительский агент.

## Обязательные источники

- openspec/changes/dispatcher-workbench/proposal.md
- openspec/changes/dispatcher-workbench/design.md
- openspec/changes/dispatcher-workbench/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-workbench-lab-profile-api-example-repair:
  - lib/workbench/lab-profile.ts
  - tools/quality-text/rules/api-example.mjs
  - openspec/changes/archive/2026-06-10-implement-workbench-task-workflow-surface/handoff.md
  - openspec/changes/release-2026-06-10-architecture/release-notes.md

## Границы исполнения

- Что входит в этот change:
  - добавить содержательный `@example` для `createLabWorkbenchInstance` в `lib/workbench/lab-profile.ts`;
  - при необходимости обновить только process-артефакты самого fix-change.
- Что сознательно не входит в этот change:
  - новая workbench semantics;
  - переработка registry/model/projection;
  - дополнительные refactor-изменения вне устранения quality gate blocker.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться:
  - shape и смысл `createLabWorkbenchInstance` уже зафиксированы предыдущим implement-step;
  - этот fix не должен менять runtime-поведение, только quality/text evidence вокруг экспортируемого API.

## Проверка результата

- verification_level: unit
- verification_command: npm run quality:text
- Что именно должен доказать результат проверки: `quality:text` больше не падает на `lib/workbench/lab-profile.ts`, а fix не создаёт новых активных нарушений.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы:
  - достаточно ли одного содержательного `@example` для закрытия правила;
  - не задевает ли локальная правка другие quality-требования в том же файле.

## Что реализовано

- В `lib/workbench/lab-profile.ts` добавлен содержательный JSDoc `@example` для `createLabWorkbenchInstance`.
- Пример показывает:
  - project-aware входные аргументы `projectId`, `taskId`, `workflowStepId`;
  - привязку `code-file` артефакта к `artifactBindings`;
  - ожидаемый `definitionId` созданного `WorkbenchInstance`.
- Runtime semantics API не менялась: shape функции, registry, model и serialization не тронуты.

## Локальная проверка исполнителя

- Выполнена sanity-команда из metadata:
  - `npm run quality:text`
- Ожидаемый результат проверки: active нарушение `api-example` в `lib/workbench/lab-profile.ts` больше не появляется.
