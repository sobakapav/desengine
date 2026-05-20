## Why

Нужен отдельный стратегический фокус на эксплуатации и развитии уже существующей функциональности, чтобы feature-ветки развивались последовательно и с понятными приоритетами.

## What Changes

- Вводится focus-change `focus-features` как верхнеуровневый контекст для feature-dispatchers.
- Диспетчеры feature-уровня привязываются к этому фокусу.

## Non-goals

- Не заменяет технические фокусы process/architecture.
- Не реализует кодовые изменения напрямую.

## Acceptance Criteria

- `focus-features` отображается в `npm run os:tree`.
- `dispatcher-ui-kit` привязан как потомок `focus-features`.
