## Why

`quality:text:repo` выявил активные нарушения `todo-format`. Это самый безопасный cleanup-срез: он не меняет runtime-поведение и быстро снижает шум repo-level gate.

## What Changes

- Привести все `TODO/FIXME` в коде к формату `TODO(owner:<owner>, targetStage:<stage>): описание`.
- Не менять смысл TODO и не удалять исторический контекст.
- Проверить `quality:text:repo` и убедиться, что `todo-format` нарушений больше нет.

## Impact

- Capability: `code-quality-text`.
- Уровень проверки: static/contract.
- Команды: `npm run quality:text:repo`, `npm run test:unit`, `npm run test:traceability`.
- Credentials: не требуются.
