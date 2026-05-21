## Context

`dispatcher-event-envelope` удерживает форму события. Но сама система журналирования требует отдельного управленческого слоя: даже без немедленной реализации нужно заранее договориться, чем является product event log и чего от него не ждать на первом этапе.

Обе линии идут как sibling-dispatcher ветки под `focus-tech` и одновременно находятся в producer-контексте `producer-event-envelope-experience-cost-boundary`: они связаны, но не находятся в отношении прямого подчинения.

## Decisions

1. `dispatcher-log-system` отвечает за архитектурную рамку журнала событий:
   - local-first природа слоя;
   - граница между raw event stream и будущими projections/aggregates;
   - lifecycle-подход без деталей реализации.

2. Dispatcher не открывает storage implementation в рамках текущей волны:
   - нет runtime-кода;
   - нет выбора тяжёлого технологического стека;
   - нет привязки к брокерам, очередям или distributed eventing.

3. Product event log рассматривается как отдельный слой рядом с общим event contract:
   - `dispatcher-event-envelope` отвечает за форму события;
   - `dispatcher-log-system` отвечает за роль журнала;
   - downstream changes используют и общий contract, и будущий log boundary;
   - связь между dispatcher выражается через зависимости и согласование решений, а не через вложенность.

## Первая implement-волна

Первый implement-step этой линии:

- `implement-log-system-runtime-boundary`:
  - вводит единый runtime-entrypoint;
  - не добавляет storage;
  - готовит безопасную основу для следующих producers.

## Scope Dispatcher

Dispatcher должен зафиксировать:

- что считается product event log в desengine;
- какие свойства этого слоя обязательны на MVP;
- какие lifecycle-вопросы сейчас только ограничиваются рамками;
- какие implement changes допустимы после завершения dispatcher-фазы.

## Risks / Trade-offs

- [Риск] Dispatcher окажется слишком абстрактным, если не будет привязан к будущим implement changes.
  → Mitigation: явно перечислить следующую волну `implement-log-system-*` changes.

- [Риск] В log-system преждевременно затянут storage-детали.
  → Mitigation: держать no-code и не выбирать сейчас конкретную тяжёлую технологию.

- [Риск] Линия log-system начнёт спорить с privacy/audit-треком, которого пока нет.
  → Mitigation: ограничиться рамками и guardrails без отдельной реализации.

## Open Questions

- Когда именно понадобится первый implement change по local store.
- Нужен ли отдельный change для export/delete boundary до runtime storage.
- Какие projections будут первыми после появления журнала: cost, experience summaries или action insights.
