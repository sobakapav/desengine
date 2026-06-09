# Handoff: fix-release-members-kind

## Миссия

- Ввести жёсткое правило: в release через `release_ref` могут входить только `implement` и `fix`.
- Запретить и инструментально ловить любые попытки привязать к релизу `focus`, `idea`, `producer`, `dispatcher` или `release`.

## Унаследованный контекст

- parent_change: `dispatcher-openspec`
- strategy_root: `focus-governance`
- release_ref: `release-2026-06-02-quality`
- producer_ref: (не задан)
- Что уже решено: release в проекте используется как delivery-матрица, а не как альтернативное родительство; `parent_change` остаётся у dispatcher, `release_ref` маркирует состав поставки.
- Кто отвечает за стратегию, тактику и приёмку результата: стратегию задаёт `focus-governance`, тактический контур OpenSpec/tooling держит `dispatcher-openspec`, финальную проверку делает внешний проверяющий.

## Обязательные источники

- `openspec/specs/admin-tools/spec.md`
- `openspec/changes/dispatcher-openspec/proposal.md`
- `openspec/changes/focus-governance/roadmaps/openspec.md`
- `tools/testing/traceability/change-rules.mjs`
- `tools/list-openspec-releases.mjs`
- `test/unit/openspec-roadmap-inheritance.test.ts`
- `test/unit/openspec-release-list.test.ts`

## Границы исполнения

- Что входит в этот change: обновление active spec, metadata validation, связанных docs и unit-тестов.
- Что сознательно не входит в этот change: переразметка чужих active changes, запуск финальной проверки, пересмотр других governance-правил release и producer.
- Какие решения уже принадлежат parent dispatcher / strategy_root и не должны переоткрываться: release уже трактуется как delivery-метка для исполнительских changes, а не как контейнер dispatcher/producer ownership.

## Проверка результата

- verification_level: `static/contract + unit`
- verification_command: `npm run test:traceability && npm run test:unit -- openspec-roadmap-inheritance openspec-release-list`
- Что именно должен доказать результат проверки: non-executable change с `release_ref` даёт ошибку metadata, а release tooling и docs не показывают dispatcher/producer как валидных членов состава.

## Открытые вопросы

- Есть ли в активном слое уже существующие некорректные `release_ref`, которые придётся отдельно чистить после включения правила.
