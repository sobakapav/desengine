## Why

`user-experience-generalization`, `user-action-logging` и `cost-accounting-layer` все хотят писать события о работе пользователя. Если реализовать их независимо, появятся три журнала с разными scoping/privacy/export/delete правилами.

Перед реализацией этих слоёв нужно исследовать и зафиксировать общий privacy-first `EventEnvelope`, который потом смогут использовать `experience`, `action log` и `cost accounting` без расхождения контрактов.

## What Changes

- Этот change становится продюсерским и фиксирует рамку для общего `EventEnvelope`.
- Определяются продюсерские вопросы по scope, privacy, redaction, retention/export/delete и adapter boundary.
- Формируется каталог MVP payload-профилей для `experience`, `action` и `cost`.
- Результатом становится не реализация, а согласованный набор решений и последующих behavior-change шагов.

## Non-goals

- Не реализуем runtime-запись событий, storage adapter и export/delete механики в коде.
- Не реализуем аналитику, dashboard или автоматическую генерацию навыков.
- Не отправляем события в облако.
- Не логируем секреты или полный high-frequency трекинг по умолчанию.

## Capabilities

### New Capabilities

- `event-envelope`: общий контракт событий.
- `experience`: события опыта как payload profile.
- `cost-accounting`: события стоимости как payload profile.

### Modified Capabilities

- `projects`, `task-model`, `workflow`: events получают scope через эти сущности.

## Acceptance Criteria

- Есть продюсерская рамка `EventEnvelope`: обязательные/опциональные поля и список открытых решений.
- Есть матрица scope-инвариантов для `project` / `task` / `workflow step` / `workbench`.
- Есть матрица privacy/redaction/export/delete правил для `experience`, `action`, `cost`.
- Есть план декомпозиции на последующие behavior-change changes и тестовый след для них.
