## Why

`producer-architecture-transformation` задаёт порядок и ожидания архитектурной волны, но ему не нужен прямой delivery-контур внутри себя. Нужен отдельный dispatcher под `focus-tech`, который возьмёт на себя тактическую последовательность downstream implementation без превращения producer в родителя.

## What Changes

- Вводится `dispatcher-architecture-transformation` под `focus-tech`.
- Dispatcher использует технический roadmap `focus-tech` и остаётся отдельным тактическим контуром по отношению к producer.
- Dispatcher координирует downstream implementation и тактические follow-up changes архитектурной волны.

## Non-goals

- Не дублирует producer-roadmap архитектурной трансформации.
- Не превращается в новую product strategy.
- Не реализует код напрямую.

## Impact

- Архитектурная волна получает отдельный delivery-контур.
- Producer и dispatcher могут расходиться в ожиданиях и порядке, не ломая схему родительства.
