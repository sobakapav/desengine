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

- обновлённый root entrypoint в `README.md` и отдельный профильный doc `docs/event-envelope-mvp.md`;
- краткое описание screen propagation MVP;
- описание ограничений первого захода;
- синхронизацию с тестовыми командами и traceability-практикой.

## Реализованная схема документации

В качестве канонических точек входа выбраны:

- `README.md` как короткий вход и указатель;
- `docs/event-envelope-mvp.md` как основной инженерный документ;
- `docs/testing-layer.md` как источник команд проверки и traceability-ожиданий.

## Разрешение противоречий

Если между ранними dispatcher/formulation-артефактами и текущим MVP есть расхождение, документация выбирает сторону уже реализованного поведения.

Для текущего этапа это означает:

- описывается ровно один runtime flow `page.tsx` → `LabScreen` → `TaskScreenSection` → `Workbench` → `CodeList`;
- не обещается storage или producer wiring, которых ещё нет;
- отдельно отмечается, что screen-level workflow-step event пока синтезирует `projectId` из `taskId`, потому что lab flow ещё не несёт самостоятельный project context.

## Deferred

Откладывается:

- большая продуктовая документация по analytics/cost/experience;
- user-facing help pages внутри интерфейса;
- полная карта будущей event-системы.
