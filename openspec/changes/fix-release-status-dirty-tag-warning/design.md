## Context

Текущая реализация release-status различает `upToDate`, `updateAvailable`, `development` и `unavailable`. Но dirty working tree поверх точного релизного тега для пользователя семантически отличается от запуска «нерелизной версии».

## Goals

- Развести tagged-but-dirty и truly-unreleased состояния.
- Сохранить предупреждение о локальных изменениях, не искажая факт релизного происхождения.

## Non-goals

- Не менять весь update-flow.
- Не вводить новый Git-workflow.

## Decisions

1. Жалоба берётся как диагностический UX/runtime bug.
2. Нужно тестировать не только condition, но и пользовательский текст статуса.
