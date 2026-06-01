## Миссия

- Довести release-матрицу OpenSpec до завершённого исполнительского состояния: закрепить root-контракт, проверить, что release умеет оркестрировать implement/fix через `release_ref`, и что исполнительский контекст возвращает разработчика к parent dispatcher.

## Унаследованный контекст

- parent_change: dispatcher-openspec
- strategy_root: focus-workflow
- release_ref: (не задан)
- producer_ref: (не задан)
- В родительском dispatcher уже зафиксированы роли changes, handoff-gate, матричная диспетчеризация release и контекстный переход через `os:ctx`.
- Кто отвечает за стратегию, тактику и приёмку результата: `focus-workflow` отвечает за стратегический контур OpenSpec, `dispatcher-openspec` отвечает за тактику tooling-слоя и принимает результат этого implement change.

## Обязательные источники

- openspec/specs/admin-tools/spec.md
- openspec/changes/dispatcher-openspec/proposal.md
- openspec/changes/dispatcher-openspec/design.md
- openspec/changes/dispatcher-openspec/tasks.md
- openspec/changes/dispatcher-openspec/specs/admin-tools/spec.md
- tools/list-openspec-releases.mjs
- tools/openspec-dispatch-change.mjs
- tools/openspec-context.mjs
- test/unit/openspec-release-list.test.ts
- test/unit/openspec-handoff.test.ts
- test/unit/openspec-roadmap-inheritance.test.ts

## Границы исполнения

- Входит: root-spec для release-матрицы, unit-покрытие листинга релизов, release-диспетчеризации и release-контекста `os:ctx`, а также приведение artifacts change к состоянию, готовому к закрытию.
- Не входит: новые роли changes, пересборка схемы metadata, изменение install-critical инфраструктуры и любые runtime-фичи вне OpenSpec tooling.
- Исполнитель не пересматривает решения родительских changes о том, что код напрямую меняют только `implement/fix`, а release остаётся неиерархическим оркестратором поставки.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Результат должен доказать:
  - `npm run os:r` показывает release как матрицу `dispatcher -> implement/fix`;
  - `os:dispatch` из release-контекста создаёт implement/fix с `parent_change` и `release_ref`;
  - `os:ctx` для release-связанного implement/fix возвращает к parent dispatcher и его inherited roadmap.

## Открытые вопросы

- На внешней проверке отдельно убедиться, что точечные unit-тесты проходят в доступном runtime, даже если штатный arm64 `rolldown` binding в локальном окружении отсутствует.
