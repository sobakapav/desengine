## Why

`producer-event-envelope-experience-cost-boundary` и `dispatcher-event-envelope` определили, что `experience`, `user-action-log` и `cost-accounting` не должны разъехаться в три разные event-модели. Первый практический шаг здесь один: сделать общий `EventEnvelope` реальным контрактом в коде.

Без этого любое следующее внедрение снова пойдёт через локальные ad-hoc структуры, а исследовательские решения останутся только в OpenSpec.

## What Changes

- Вводится общий кодовый контракт `EventEnvelope` для продуктовых событий.
- Для MVP фиксируется обязательный минимальный набор полей envelope:
  - `eventId`;
  - `kind`;
  - `occurredAt`;
  - `scope`;
  - `privacyClass`;
  - `redactionState`;
  - `payload`;
- Появляются общие типы/enum/utility для:
  - `kind`;
  - scope-полей (`projectId`, `taskId`, `workflowStepId`, `workbenchInstanceId`);
  - `privacyClass`;
  - `redactionState`;
  - `payload`;
- Для MVP фиксируются допустимые scope-комбинации:
  - `project`;
    только `projectId`;
  - `task`;
    `projectId + taskId`;
  - `workflow-step`;
    `projectId + taskId + workflowStepId`;
  - `workbench-instance`;
    `projectId + workbenchInstanceId`;
- Явно запрещаются смешанные и неполные комбинации:
  - `taskId` без `projectId`;
  - `workflowStepId` без `taskId`;
  - `workflowStepId` вместе с `workbenchInstanceId`;
  - `taskId` вместе с `workbenchInstanceId`;
  - пустой `scope`.
- Добавляется runtime-валидация или equivalent source-contract layer для envelope-инвариантов.
- Появляются reusable fixture/builders для валидных event-форм разных scope-комбинаций.

## Non-goals

- Не добавляем storage и не делаем event log persistence.
- Не подключаем `experience`, `cost` или `action` producers к реальным runtime-flow.
- Не строим аналитику, export/delete и retention.
- Не меняем пользовательское поведение.
- Не вводим отдельные payload-схемы для каждого `kind` за пределами минимальных fixture/builders.
- Не добавляем версионирование формата (`schemaVersion`), маршрутизацию событий, дедупликацию и correlation/causation metadata.
- Не расширяем scope за пределы четырёх комбинаций MVP и не поддерживаем multi-project/multi-task события.

## Capabilities

### Modified Capabilities

- `event-envelope`: общий контракт событий становится кодовым foundation-слоем.
- `experience`: downstream experience changes получают общий кодовый event contract.
- `cost-accounting`: downstream cost changes получают общий кодовый event contract.
- `user-action-log`: downstream action changes получают общий кодовый event contract.

## Acceptance Criteria

- В коде есть один reusable контракт `EventEnvelope`, который не дублируется в разных подсистемах.
- Контракт требует поля `eventId`, `kind`, `occurredAt`, `scope`, `privacyClass`, `redactionState`, `payload`; отсутствие любого из них считается невалидным envelope.
- Есть единый слой валидации/contract-check, который принимает только четыре scope-комбинации MVP: `project`, `task`, `workflow-step`, `workbench-instance`.
- Есть fixture/builders для минимум трёх семейств событий: `experience`, `action`, `cost`, и каждый fixture опирается на общий envelope без локальных ad-hoc shape.
- Есть unit/contract tests, которые отдельно покрывают:
  - валидные envelope для каждой допустимой scope-комбинации;
  - невалидные envelope с отсутствующими обязательными полями;
  - невалидные envelope со смешанными scope-полями;
  - допустимые и недопустимые значения `privacyClass` и `redactionState`.
- Первый implement-step считается завершённым, когда foundation-слой контракта готов к переиспользованию downstream changes без подключения реальных producers, storage и runtime wiring.
- Foundation-слой прямо готовит следующий наблюдаемый шаг: `implement-screen-event-envelope-propagation` не должен проектировать отдельный event shape заново.
- Для change зафиксирована тестовая интеграция в единый слой проверки: `npm run test:unit` и `npm run test:traceability`, либо traceability-blocker оформлен явно по правилам репозитория.
