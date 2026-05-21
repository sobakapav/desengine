## Миссия

- Добавить в OpenSpec tooling отдельный `handoff.md` и сделать его обязательным gate перед стартом implement/fix, чтобы создатель child change передавал исполнителю содержательный контекст, а не только scaffold.

## Унаследованный контекст

- parent_change: dispatcher-openspec
- strategy_root: focus-workflow
- release_ref: (не задан)
- В родительском dispatcher уже зафиксирована продуктово-ориентированная схема change и preflight-подход для dispatcher/release-контекста.

## Обязательные источники

- openspec/changes/dispatcher-openspec/proposal.md
- openspec/changes/dispatcher-openspec/design.md
- openspec/changes/dispatcher-openspec/tasks.md
- tools/create-openspec-change.mjs
- tools/openspec-begin-change.mjs
- tools/openspec-dispatch-change.mjs
- tools/README.md

## Границы исполнения

- Входит: отдельный handoff-артефакт, автоматическое создание handoff для новых changes, preflight-gate в `os:begin`, обновление `os:ctx`, документации и unit-тестов.
- Не входит: новые install-critical зависимости, изменение OpenSpec CLI-схемы вне локального tooling, автоматическое заполнение handoff за автора.

## Проверка результата

- verification_level: unit
- verification_command: npm run test:unit
- Результат должен доказать, что новый change получает `handoff.md`, а `os:begin` не пропускает implement/fix с незаполненным handoff.

## Открытые вопросы

- Проверить на внешней верификации, не нужен ли отдельный contract-тест на отображение `handoff.md` в более широком workflow вокруг `openspec instructions apply`.
