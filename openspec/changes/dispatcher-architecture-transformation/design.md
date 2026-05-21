## Context

`focus-tech` удерживает стратегический технический контур. `producer-architecture-transformation` формирует продюсерский порядок и ожидания. Для downstream implementation нужен отдельный dispatcher, который тактически управляет delivery и не делает producer прямым родителем.

## Decisions

1. `dispatcher-architecture-transformation` подчиняется `focus-tech`, а не producer.
2. Producer `producer-architecture-transformation` остаётся внешним стратегическим контекстом и не записывается в metadata dispatcher.
3. Dispatcher ведёт downstream implementation и cleanup как отдельную delivery-линию.

## Risks / Trade-offs

- [Риск] Producer и dispatcher предложат разный порядок шагов.
  → Mitigation: считать такое расхождение явным управленческим сигналом, а не ошибкой схемы.

- [Риск] Архитектурная волна снова распадётся на параллельные unrelated changes.
  → Mitigation: держать downstream changes внутри тактического dispatcher-контура или его явных sibling-веток.
