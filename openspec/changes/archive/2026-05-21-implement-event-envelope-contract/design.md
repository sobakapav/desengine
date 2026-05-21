## Context

Это первый implement-step всей событийной линии. Его задача не в том, чтобы начать собирать реальные события, а в том, чтобы закрепить в коде единый контракт, через который потом будут обязаны проходить downstream producers.

## Decisions

1. Реализуется один общий `EventEnvelope`, а не несколько доменных базовых событий.

2. В общий envelope входят только cross-cutting поля, и для MVP они обязательны все:
   - `eventId` как стабильный идентификатор события;
   - `kind` как дискриминатор payload family;
   - `occurredAt` как timestamp бизнес-события;
   - `scope` как объект контекста события;
   - `privacyClass`;
   - `redactionState`;
   - `payload` как контейнер доменных данных.

3. Доменные различия (`experience`, `action`, `cost`) остаются в payload profiles и fixture-примерах, но не поднимаются в общий контракт.

4. Валидация должна проверять минимум:
   - наличие обязательных полей;
   - допустимость сочетаний scope;
   - допустимость `privacyClass` и `redactionState`;
   - отсутствие неявного дублирования формата в других местах.

5. Для MVP scope ограничивается четырьмя именованными комбинациями:
   - `project`: только `projectId`;
   - `task`: `projectId + taskId`;
   - `workflow-step`: `projectId + taskId + workflowStepId`;
   - `workbench-instance`: `projectId + workbenchInstanceId`.

6. Любая scope-форма вне этой матрицы считается невалидной, даже если выглядит полезной для будущих changes:
   - `taskId` без `projectId`;
   - `workflowStepId` без `taskId` и `projectId`;
   - совместное наличие `workflowStepId` и `workbenchInstanceId`;
   - совместное наличие `taskId` и `workbenchInstanceId`;
   - пустой `scope`;
   - дополнительные scope-оси сверх четырёх MVP-комбинаций.

## MVP Scope

В рамках первого захода change должен дать:

- кодовый shape `EventEnvelope` с обязательными полями `eventId`, `kind`, `occurredAt`, `scope`, `privacyClass`, `redactionState`, `payload`;
- слой валидации/contract-check, который жёстко держит MVP-матрицу scope;
- fixture/builders для типовых событий `experience`, `action`, `cost` на базе общего envelope;
- unit/contract tests для обязательных полей, scope-матрицы и privacy/redaction;
- traceability к сценарию `event-envelope` и foundation-сценариям downstream payload families;
- критерий готовности первого шага: downstream changes могут импортировать один foundation-контракт, в том числе для screen-level propagation, но ещё не обязаны писать реальные события в runtime.

## Deferred

Откладывается на следующие changes:

- запись событий в runtime;
- storage;
- wiring producers;
- export/delete/retention implementation;
- projections и aggregates.
- расширение списка scope-комбинаций;
- `schemaVersion`, correlation/causation metadata, source metadata;
- отдельная строгая схема payload по каждому `kind`;
- миграции, обратная совместимость и правила эволюции формата.

## Risks / Trade-offs

- [Риск] Контракт окажется слишком абстрактным и неудобным для downstream changes.
  → Mitigation: сразу добавить fixture/builders по трём payload families.

- [Риск] В envelope затянут слишком много доменной семантики.
  → Mitigation: держать общим только cross-cutting metadata.

- [Риск] Runtime validation усложнит слой без пользы.
  → Mitigation: достаточно минимального source-contract/validator уровня, без тяжёлой схемной платформы.
