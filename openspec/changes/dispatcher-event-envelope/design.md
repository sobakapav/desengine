## Context

Исследовательский change по `EventEnvelope` уже определил продуктовую мотивацию и рамки. Следующий шаг не в коде, а в техническом управлении внедрением: нужен отдельный dispatcher в продуктовой event-линии, который удерживает общий контракт события как foundation-границу для нескольких будущих подсистем.

## Decisions

1. `dispatcher-event-envelope` отвечает только за форму и инварианты события:
   - ядро envelope;
   - правила scope;
   - разделение envelope vs payload;
   - список обязательных downstream consumers.

2. Dispatcher не берёт на себя хранение и lifecycle event log:
   - это отдельная линия `dispatcher-log-system`;
   - storage, export/delete и append-only semantics не смешиваются с проектированием самого envelope.

3. Первый набор downstream consumers фиксируется сразу:
   - `experience`;
   - `user-action-log`;
   - `cost-accounting`.

4. Любой follow-up implement change по этим линиям должен:
   - ссылаться на `dispatcher-event-envelope`;
   - явно описывать свой payload profile;
   - не вводить собственный альтернативный базовый event contract.

## Первая implement-волна

Первый практический шаг этой линии разбивается на:

- `implement-event-envelope-contract` как кодовое закрепление общего `EventEnvelope`;
- `implement-screen-event-envelope-propagation` как первый наблюдаемый runtime-step page-to-screen event flow;
- `implement-log-system-runtime-boundary` как следующий downstream-step через отдельный dispatcher.

## Scope Dispatcher

Dispatcher обязан описать:

- минимальный `EventEnvelope` contract;
- допустимые формы scope;
- набор payload profile families;
- список открытых решений, которые не должны блокировать первый implement wave.

## Risks / Trade-offs

- [Риск] Dispatcher останется декларативным и не защитит от расхождения downstream changes.
  → Mitigation: считать общий envelope обязательной зависимостью для будущих implement changes.

- [Риск] В envelope начнут поднимать слишком много доменной семантики.
  → Mitigation: жёстко держать правило, что доменные различия живут в payload.

- [Риск] Envelope и log-system смешаются в один слишком тяжёлый контур.
  → Mitigation: фиксировать отдельные dispatcher и отдельные non-goals.

## Open Questions

- Нужен ли `schemaVersion` в MVP как часть обязательного ядра.
- Нужен ли отдельный `source`/`sessionId` в первом implement wave.
- Какие downstream changes будут первыми: `experience`, `cost` или `action`.
