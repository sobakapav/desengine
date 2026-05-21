## Context

Этот change реализует самую узкую часть `dispatcher-log-system`, которую можно сделать без storage, producer wiring и пользовательских расширений. Цель: зафиксировать одну runtime-boundary записи событий и на этом остановиться.

## Decisions

1. Реализуется ровно один runtime entrypoint для записи событий.

2. Boundary строится поверх общего `EventEnvelope`, а не допускает payload-first вызовы, ad-hoc shape или альтернативные фасады для той же операции.

3. По умолчанию используется один лёгкий adapter:
   - `no-op` или `stub`;
   - без persistent или `in-memory` storage;
   - без внешних зависимостей;
   - пригодный для unit/service tests.

4. Реальные producers в этом change не подключаются. Даже точечное internal usage допустимо только как технический тестовый вызов boundary и не должно превращаться в product wiring.

5. Change не меняет пользовательское поведение. Если для демонстрации boundary нужен observable effect, он должен жить на уровне тестового harness, а не пользовательского flow.

## MVP Scope

В рамках первого захода change должен дать только:

- интерфейс/сервис записи события;
- adapter contract;
- default lightweight adapter;
- unit/service tests;
- traceability к foundation-сценариям log-system.

Первый заход сознательно не должен давать:

- storage abstraction с несколькими реализациями;
- wiring источников событий;
- пользовательский сценарий, где событие впервые начинает записываться «по-настоящему».

## Deferred

Откладывается:

- persistent local store;
- любой runtime buffer, который начинает играть роль хранения;
- export/delete implementation;
- retention policy implementation;
- wiring `experience`, `action`, `cost` producers;
- projections/aggregates.

## Proof Of Usefulness

Change считается доказанно полезным, если после него downstream change может безопасно опереться на boundary по следующей схеме:

- передать валидный `EventEnvelope` в один entrypoint;
- получить предсказуемое поведение через default stub/no-op adapter;
- не принимать решений про storage, delivery и producer wiring.

Если для следующего change всё ещё нужно заново проектировать точку входа, sink contract или режим без storage, этот change считается недостаточно жёстким.

## Risks / Trade-offs

- [Риск] Boundary будет слишком искусственным без реальных producers.
  → Mitigation: делать её максимально узкой и оценивать полезность только по тому, снимает ли она необходимость проектировать второй entrypoint.

- [Риск] В change случайно затянут storage implementation.
  → Mitigation: явно оставить только stub/no-op adapter и запретить `in-memory` storage как «временное, но уже хранилище».

- [Риск] Появится второй entrypoint позже в одном из downstream changes.
  → Mitigation: proposal, tasks и tests должны прямо фиксировать boundary как единственную допустимую точку записи.
