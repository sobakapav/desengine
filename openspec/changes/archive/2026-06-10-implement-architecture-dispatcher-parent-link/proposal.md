## Why

Нужен исполнительский change для реализации задачи parent owner.

## What Changes

- Реализовать прямой lineage `dispatcher-architecture -> producer-architecture-transform`, не меняя стратегический корень `focus-tech`.
- Явно привязать dispatcher к implementation plan producer'а через metadata и описательные артефакты.
- Обновить исполнительский change так, чтобы из него были понятны сделанная правка, границы ответственности и способ внешней static/contract-проверки.

## Impact

- Изменение закрывает конкретный исполнительский срез в рамках текущего parent owner и устраняет неявность между tactical dispatcher и producer-линейкой архитектурной трансформации.
