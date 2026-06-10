## Миссия

- Что должен изменить этот change: Починить unit-регрессии project-aware task runtime после архитектурной волны: mock/export контракты, client boundary и сигнатуры server mutations
- Этот change меняет код только на уровне implement/fix и не пересматривает решения родительских changes.

## Унаследованный контекст

- parent_change: dispatcher-project
- strategy_root: focus-domain
- release_ref: release-2026-06-10-architecture
- producer_ref: producer-project
- Что из родительского change уже решено: `dispatcher-project` уже зафиксировал project-wave как последовательность foundation, onboarding/task layer, workflow layer и workbench binding; archived handoff дочерних волн уже закрепили, что текущий runtime repair не должен переоткрывать product-смысл `Project`, а только вернуть unit-совместимость task runtime после project-aware изменений.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию project-линии удерживает `producer-project`, тактическую маршрутизацию и границы первой волны держит `dispatcher-project`, итоговую внешнюю проверку выполняет другой проверяющий, а не исполнитель этого fix.

## Обязательные источники

- openspec/changes/dispatcher-project/proposal.md
- openspec/changes/dispatcher-project/design.md
- openspec/changes/dispatcher-project/tasks.md
- Какие ещё файлы и спецификации обязательны к чтению для fix-project-runtime-unit-contract-repair: `openspec/changes/archive/2026-06-10-implement-project-workspace-mvp/handoff.md`, `openspec/changes/archive/2026-06-10-implement-project-task-onboarding-binding/handoff.md`, `openspec/changes/archive/2026-06-10-implement-project-workflow-binding/handoff.md`, `lib/task/project-runtime-scope.ts`, `lib/task/task-screen-data.ts`, `lib/task/server-runtime-mutations.ts`, `test/unit/task-iterate-noop-feedback.test.ts`, `test/unit/task-project-client-boundary.test.ts`, `test/unit/task-screen-data.test.ts`, `test/unit/task-server-runtime-mutations.test.ts`.

## Границы исполнения

- Что входит в этот change: синхронизация unit-контрактов вокруг project-aware task runtime, включая mock/export контракты `@/lib/user/server`, ожидания helper tests под новую project-aware сигнатуру и приведение change-артефактов (`handoff`, `tasks`, metadata, `artifacts/release-note.md`) к состоянию готовности для внешней проверки.
- Что сознательно не входит в этот change: пересмотр product-логики project-wave, изменение `docs/architecture/**`, ручное редактирование release notes релиза, закрытие change через `os:close`, полный `npm run test:full` или внешняя финальная верификация.
- Какие решения уже принадлежат parent change / strategy_root и не должны переоткрываться: порядок project-wave, canonical `ProjectWorkspace`, project-aware onboarding/workflow/workbench semantics и сам смысл active project boundary уже определены родительскими change-линиями и archived handoff; этот fix только восстанавливает совместимость unit-layer с уже принятыми решениями.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit -- test/unit/task-iterate-noop-feedback.test.ts test/unit/task-project-client-boundary.test.ts test/unit/task-screen-data.test.ts test/unit/task-server-runtime-mutations.test.ts
- Что именно должен доказать результат проверки: project-aware task runtime остаётся совместимым с unit-слоем в четырёх критичных срезах: no-op iterate не ломается из-за нового server export-контракта, task screen data ожидает новую project-aware сигнатуру, reset/mutation helpers передают project-аргумент консистентно, а client boundary по-прежнему читает и отправляет active project.

## Открытые вопросы

- Какие вопросы исполнитель должен закрыть по ходу работы: какие unit-регрессии реально воспроизводятся в текущем дереве; достаточно ли синхронизировать тестовые ожидания без правки продуктового runtime; нужно ли сужать `verification_command` до repair-среза вместо общего `npm run test:unit`.
