## Why

Cloud и Electron packaging нельзя начинать как behavior implementation, пока project/task/artifact/event storage не имеет adapter boundary. Иначе packaging зацементирует локальный формат `user/` или создаст параллельный storage слой.

Этот change готовит storage adapters к будущим packaging changes, но не реализует cloud/electron упаковку.

## What Changes

- Определяется общий storage adapter readiness contract для local/electron/cloud.
- Фиксируются export/delete/backup/migration requirements.
- Секреты и credentials отделяются от project/task/event data.
- Packaging changes получают checklist готовности перед реализацией.

## Non-goals

- Не реализуем Electron app.
- Не реализуем hosted cloud.
- Не меняем storage backend в этом change.
- Не переносим secrets без отдельного security decision.

## Capabilities

### Modified Capabilities

- `storage-adapter`: расширяется readiness contract для packaging.
- `packaging`: получает критерии допуска к реализации.

## Acceptance Criteria

- Есть checklist, при котором packaging implementation может стартовать безопасно.
- Local storage adapter имеет понятные boundaries для project/task/artifact/event data.
- Export/delete и migration требования описаны и тестируемы.
- Секреты не смешиваются с project/event storage.
