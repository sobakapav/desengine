## Context

Этот change закрывает обязательную документационную часть MVP event-линии. Его задача не просто “обновить README”, а сделать наблюдаемое поведение и ограничения первого захода явными для следующих implement changes.

## Decisions

1. Документация ведётся отдельным change под `dispatcher-doc`, а не растворяется в runtime-изменениях.

2. В документации должны появиться три уровня понимания:
   - foundation: общий `EventEnvelope`;
   - runtime boundary: общий entrypoint записи события;
   - наблюдаемый MVP: page-to-screen propagation flow.

3. Документация должна быть честной:
   - не обещать storage, analytics и полную event-систему;
   - явно отмечать deferred-части;
   - ссылаться на тестовый контур и проверяемые команды.

## MVP Scope

В рамках первого захода change должен дать:

- обновлённый root или профильный docs entrypoint по event-линии;
- краткое описание screen propagation MVP;
- описание ограничений первого захода;
- синхронизацию с тестовыми командами и traceability-практикой.

## Deferred

Откладывается:

- большая продуктовая документация по analytics/cost/experience;
- user-facing help pages внутри интерфейса;
- полная карта будущей event-системы.
