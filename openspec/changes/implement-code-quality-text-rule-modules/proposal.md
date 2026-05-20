## Why

Диспетчер `dispatcher-code-quality-text-subsystem` требует, чтобы правила подсистемы `code-quality-text` были отдельными атомарными модулями, а не оставались внутри монолитного `engine.mjs`.

## What Changes

- Создать `tools/quality-text/rules/*.mjs` для правил `file-length`, `function-length`, `todo-format`, `boolean-trap`, `floating-promise`, `api-example`.
- Оставить `engine.mjs` оркестратором scope, TypeScript program, waiver и report flow.
- Сохранить поведение команд `quality:text*` и legacy alias `test:readability*`.

## Impact

- Capability: `code-quality-text`.
- Уровень проверки: unit/static contract.
- Команды проверки: `npm run test:unit`, `npm run quality:text`, `npm run test:traceability`.
- Mock/credentials: не требуются; используются локальные файлы и локальные waivers.
